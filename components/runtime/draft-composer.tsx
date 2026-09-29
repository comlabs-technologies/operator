"use client";

import { ArrowRight, Check, ChevronDown, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { executeTool } from "@/lib/mcp/gateway";
import { emailCall } from "@/lib/mock/approvals";
import { getCustomer, overdueInvoices, reactivationCandidates } from "@/lib/mock/company";
import { paymentReminder, reactivationEmail, type EmailDraft } from "@/lib/mock/emails";
import { agentActor, runCalls } from "@/lib/runtime/execute";
import { useOperator } from "@/lib/store";
import { cn, formatINR, formatLakh } from "@/lib/utils";
import { EmailPreview } from "./email-preview";
import { appendTraceLine, ExecutionTrace } from "./execution-trace";

type Kind = "payment_reminder" | "outreach";
type Phase = "preparing" | "prepared" | "requesting" | "requested";

const config = {
  payment_reminder: { agentId: "finance-assistant", noun: "reminder", preparing: "Preparing reminders…" },
  outreach: { agentId: "sales-assistant", noun: "personalized draft", preparing: "Preparing outreach…" },
} as const;

function buildDrafts(kind: Kind, subjects: string[]) {
  if (kind === "payment_reminder") {
    return overdueInvoices.filter((i) => subjects.includes(i.id)).map(paymentReminder);
  }
  return reactivationCandidates.filter((c) => subjects.includes(c.customerId)).map(reactivationEmail);
}

/**
 * Prepares customer emails through the gateway (drafting is allowed), then
 * submits the send for approval (sending always requires review).
 */
export function DraftComposer({ kind, subjects, onRequested }: { kind: Kind; subjects: string[]; onRequested?: (approvalId: string) => void }) {
  const { agentId, noun } = config[kind];
  const hooks = useOperator((s) => s.hooks);
  const recordEvent = useOperator((s) => s.recordEvent);
  const requestApproval = useOperator((s) => s.requestApproval);
  const [phase, setPhase] = useState<Phase>("preparing");
  const [lines, setLines] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [approvalId, setApprovalId] = useState<string>();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const list = buildDrafts(kind, subjects);
    const log = (m: string) => setLines((l) => appendTraceLine(l, m));
    const calls =
      kind === "payment_reminder"
        ? [
            { toolId: "erp.get_customer", input: { customer_ids: overdueInvoices.filter((i) => subjects.includes(i.id)).map((i) => i.customerId) } },
            ...list.map((d) => ({ toolId: "gmail.draft_email", input: { to: d.to, subject: d.subject, company: d.company } })),
          ]
        : list.map((d) => ({ toolId: "gmail.draft_email", input: { to: d.to, subject: d.subject, company: d.company } }));
    void runCalls(calls, agentId, hooks(log)).then(() => {
      setLines((l) => [...l, `Prepared ${list.length} ${noun}${list.length === 1 ? "" : "s"}`]);
      setDrafts(list);
      setPhase("prepared");
    });
  }, [kind, subjects, agentId, noun, hooks]);

  const request = async () => {
    setPhase("requesting");
    const held = await executeTool(
      "gmail.send_email",
      { mailbox: drafts[0].mailbox, recipients: drafts.length, company: drafts.length === 1 ? drafts[0].company : `${drafts.length} customers` },
      { actor: agentActor(agentId, "Pawan"), agentId, audit: recordEvent },
    );
    if (held.result !== "pending_approval") return;

    const approval =
      kind === "payment_reminder"
        ? (() => {
            const invoices = overdueInvoices.filter((i) => subjects.includes(i.id));
            const total = invoices.reduce((s, i) => s + i.amount, 0);
            return requestApproval({
              kind,
              title: invoices.length === 1 ? "Payment reminder" : "Payment reminders",
              subject: invoices.length === 1 ? getCustomer(invoices[0].customerId)!.name : `${invoices.length} customers`,
              reference: invoices.length === 1 ? invoices[0].id : `${invoices[0].id} +${invoices.length - 1}`,
              amount: total,
              detail: `${Math.min(...invoices.map((i) => i.daysOverdue))}–${Math.max(...invoices.map((i) => i.daysOverdue))} days overdue`,
              requestedBy: "Finance Assistant",
              agentId,
              reason: invoices.some((i) => i.daysOverdue > 60)
                ? "Reminders for invoices more than 60 days overdue require owner approval."
                : "Every outbound customer email is reviewed before it is sent.",
              actionLabel: "Approve & send",
              action: { toolId: "gmail.send_email", calls: drafts.map(emailCall) },
              context: invoices.map((i) => ({ label: getCustomer(i.customerId)!.name, value: `${i.id} · ${formatINR(i.amount)}`, hint: `${i.daysOverdue} days overdue`, tone: i.daysOverdue > 60 ? ("warning" as const) : undefined })),
              summary: `${invoices.length} reminders totalling ${formatINR(total)}. Each is addressed to the billing contact on file in the ERP and sent from accounts@.`,
              emails: drafts,
              covers: invoices.map((i) => i.id),
            });
          })()
        : (() => {
            const cands = reactivationCandidates.filter((c) => subjects.includes(c.customerId));
            return requestApproval({
              kind,
              title: "Reactivation outreach",
              subject: `${cands.length} customers`,
              reference: cands.map((c) => getCustomer(c.customerId)!.name.split(" ")[0]).join(", "),
              detail: `${formatLakh(cands.reduce((s, c) => s + c.previousPurchases, 0))} previous purchases`,
              requestedBy: "Sales Assistant",
              agentId,
              reason: "Every outbound customer email is reviewed before it is sent.",
              actionLabel: "Approve & send",
              action: {
                toolId: "gmail.send_email",
                calls: drafts.map((d) => ({ ...emailCall(d), owner: getCustomer(d.ref)?.owner })),
              },
              context: cands.map((c) => ({ label: getCustomer(c.customerId)!.name, value: formatLakh(c.previousPurchases), hint: `Last purchase ${c.monthsSinceOrder} months ago` })),
              summary: "Each draft references the customer's last order and is signed by their account owner. Sending creates a follow-up task for the owner in HubSpot.",
              emails: drafts,
              covers: cands.map((c) => c.customerId),
            });
          })();

    setApprovalId(approval.id);
    setPhase("requested");
    onRequested?.(approval.id);
    toast.success("Approval requested", {
      description: `${approval.id} · ${approval.title} for ${approval.subject}`,
      action: { label: "View", onClick: () => router.push(`/approvals?id=${approval.id}`) },
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="px-4 py-3.5">
        <ExecutionTrace lines={lines} running={phase === "preparing"} />
      </div>

      <AnimatePresence initial={false}>
        {phase !== "preparing" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="border-t border-line">
            <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-md border border-line bg-surface-muted">
                  <FileText className="size-3.5 text-ink-2" />
                </span>
                <div>
                  <div className="text-sm font-medium text-ink">
                    {drafts.length} {noun}
                    {drafts.length === 1 ? "" : "s"} prepared.
                  </div>
                  <div className="text-xs text-muted">Saved as drafts in {drafts[0]?.mailbox}acmeindustrial.in · nothing has been sent</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="md" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
                  Review emails
                  <ChevronDown className={cn("size-3.5 text-muted transition-transform duration-150", expanded && "rotate-180")} />
                </Button>
                {phase === "requested" ? (
                  <Button variant="secondary" asChild>
                    <Link href={`/approvals?id=${approvalId}`}>
                      <Check className="size-3.5 text-green" /> {approvalId} requested <ArrowRight className="size-3.5 text-muted" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="primary" onClick={request} disabled={phase === "requesting"}>
                    <ShieldCheck className="size-3.5" />
                    {phase === "requesting" ? "Requesting…" : "Request approval"}
                  </Button>
                )}
              </div>
            </div>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 border-t border-line bg-surface-muted px-4 py-4">
                    {drafts.map((d) => (
                      <EmailPreview key={d.id} email={d} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
