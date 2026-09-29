"use client";

import { AlertTriangle, CheckCircle2, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { EmailPreview } from "@/components/runtime/email-preview";
import { ApprovalStatusBadge, PermissionBadge } from "@/components/shared/badges";
import { FieldLabel } from "@/components/shared/detail-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTool } from "@/lib/mcp/registry";
import { getAgent } from "@/lib/mock/agents";
import type { Approval, ApprovalStatus } from "@/lib/mock/approvals";
import { tataQuote } from "@/lib/mock/company";
import { useOperator } from "@/lib/store";
import { cn, formatINR, relativeTime } from "@/lib/utils";

type Tab = "pending" | "approved" | "rejected" | "all";

const inTab = (tab: Tab, status: ApprovalStatus) =>
  tab === "all" ? true : tab === "rejected" ? status === "rejected" || status === "changes_requested" : status === tab;

function ApprovalCard({ approval, onOpen }: { approval: Approval; onOpen: () => void }) {
  const decide = useOperator((s) => s.decideApproval);
  const processing = useOperator((s) => s.processing[approval.id]);
  const agent = getAgent(approval.agentId);
  const pending = approval.status === "pending";

  const approve = async () => {
    await decide(approval.id, "approve");
    toast.success(`${approval.title} approved`, { description: `${approval.subject} · executed and recorded in Activity` });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget === e.target && onOpen()}
      className="group grid cursor-pointer gap-4 px-4 py-4 outline-none transition-colors duration-150 hover:bg-surface-muted focus-visible:bg-hover sm:px-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-center"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-medium text-ink-2">{approval.title}</span>
          <span className="text-line-strong">·</span>
          <span className="font-mono text-[11px]">{approval.reference}</span>
          {!pending && <ApprovalStatusBadge status={approval.status} />}
        </div>
        <div className="text-[15px] leading-6 text-ink">{approval.subject}</div>
        <div className="flex items-baseline gap-2 text-sm">
          {approval.amount !== undefined && <span className="tabular font-medium text-ink">{formatINR(approval.amount)}</span>}
          {approval.detail && <span className="text-muted">{approval.detail}</span>}
        </div>
      </div>

      <div className="min-w-0 space-y-1 text-sm">
        <div className="text-ink-2">
          <span className="text-muted">Requested by</span> {approval.requestedBy}
          {agent && !approval.requestedBy.includes(agent.name) && (
            <>
              <span className="text-muted"> via</span> {agent.name}
            </>
          )}
        </div>
        <div className="flex items-start gap-1.5 text-xs text-muted">
          <ShieldCheck className="mt-px size-3.5 shrink-0" />
          <span className="line-clamp-2">{approval.status === "superseded" || approval.status === "rejected" || approval.status === "changes_requested" ? approval.note ?? approval.reason : approval.reason}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:justify-end" onClick={(e) => e.stopPropagation()}>
        {pending ? (
          processing ? (
            <span className="flex h-8 items-center gap-2 text-sm text-muted">
              <Loader2 className="size-3.5 animate-spin" /> Executing securely…
            </span>
          ) : (
            <>
              <Button size="md" onClick={() => void decide(approval.id, "reject")}>
                Reject
              </Button>
              <Button size="md" variant="primary" onClick={() => void approve()}>
                {approval.actionLabel}
              </Button>
            </>
          )
        ) : (
          <span className="text-xs text-muted">
            {approval.decidedBy ? `${approval.decidedBy} · ` : ""}
            {approval.decidedAt ? relativeTime(approval.decidedAt) : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function QuoteLines() {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-muted text-xs text-muted">
            <th className="h-8 px-3 text-left font-normal">Item</th>
            <th className="h-8 px-3 text-right font-normal">Qty</th>
            <th className="h-8 px-3 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody className="tabular">
          {tataQuote.lines.map((l) => (
            <tr key={l.sku} className="border-b border-line">
              <td className="px-3 py-2 text-ink-2">{l.item}</td>
              <td className="px-3 py-2 text-right text-ink-2">{l.qty}</td>
              <td className="px-3 py-2 text-right text-ink">{formatINR(l.qty * l.unitPrice)}</td>
            </tr>
          ))}
          {[
            ["List value", formatINR(tataQuote.listValue)],
            [`Discount ${tataQuote.discountPct}%`, `−${formatINR(tataQuote.discount)}`],
            ["GST 18%", formatINR(tataQuote.gst)],
          ].map(([k, v]) => (
            <tr key={k} className="border-b border-line text-xs">
              <td colSpan={2} className="px-3 py-1.5 text-right text-muted">{k}</td>
              <td className={cn("px-3 py-1.5 text-right", k.startsWith("Discount") ? "text-amber" : "text-ink-2")}>{v}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="px-3 py-2 text-right text-xs text-muted">Total</td>
            <td className="px-3 py-2 text-right font-medium text-ink">{formatINR(tataQuote.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ApprovalDrawer({ approval, onClose }: { approval: Approval | undefined; onClose: () => void }) {
  const decide = useOperator((s) => s.decideApproval);
  const processing = useOperator((s) => (approval ? s.processing[approval.id] : false));
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const tool = approval ? getTool(approval.action.toolId)?.definition : undefined;
  const agent = approval ? getAgent(approval.agentId) : undefined;

  const act = async (decision: "approve" | "reject" | "changes") => {
    if (!approval) return;
    await decide(approval.id, decision, decision === "changes" ? note : undefined);
    toast.success(decision === "approve" ? `${approval.title} approved` : decision === "reject" ? `${approval.title} rejected` : "Changes requested", {
      description: `${approval.subject} · recorded in Activity`,
    });
    setNoteOpen(false);
    setNote("");
    if (decision !== "approve") onClose();
  };

  return (
    <Sheet open={!!approval} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        {approval && (
          <>
            <SheetHeader>
              <div className="mb-1.5 flex items-center gap-2 text-xs text-muted">
                <span className="font-mono">{approval.id}</span>
                <span className="text-line-strong">·</span>
                <span>{relativeTime(approval.createdAt)}</span>
                <ApprovalStatusBadge status={approval.status} />
              </div>
              <SheetTitle>
                {approval.title} · {approval.subject}
              </SheetTitle>
              <SheetDescription>
                Requested by {approval.requestedBy}
                {agent && !approval.requestedBy.includes(agent.name) ? ` via ${agent.name}` : ""}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-6">
              {approval.amount !== undefined && (
                <div>
                  <div className="text-xs text-muted">{approval.reference}</div>
                  <div className="tabular text-[26px] leading-8 font-medium tracking-[-0.02em] text-ink">{formatINR(approval.amount)}</div>
                  {approval.detail && <div className="text-sm text-muted">{approval.detail}</div>}
                </div>
              )}

              <div className="flex gap-2.5 rounded-lg border border-amber-line bg-amber-bg px-3.5 py-3 text-sm text-amber">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{approval.reason}</span>
              </div>

              <div>
                <FieldLabel>Context</FieldLabel>
                <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-line">
                  {approval.context.map((row, i) => (
                    <div key={row.label} className={cn("space-y-0.5 px-3.5 py-3", i % 2 === 1 && "border-l border-line", i >= 2 && "border-t border-line")}>
                      <dt className="text-xs text-muted">{row.label}</dt>
                      <dd className={cn("text-sm", row.tone === "warning" ? "text-amber" : "text-ink")}>{row.value}</dd>
                      {row.hint && <dd className="text-xs text-muted">{row.hint}</dd>}
                    </div>
                  ))}
                </dl>
              </div>

              {approval.summary && (
                <div>
                  <FieldLabel>Summary · prepared by {agent?.name}</FieldLabel>
                  <p className="rounded-lg border border-line bg-surface-muted px-3.5 py-3 text-sm leading-6 text-ink-2">{approval.summary}</p>
                </div>
              )}

              {approval.reference === tataQuote.id && (
                <div>
                  <FieldLabel>Quotation</FieldLabel>
                  <QuoteLines />
                </div>
              )}

              {approval.emails && approval.emails.length > 0 && (
                <div>
                  <FieldLabel>
                    Email preview{approval.emails.length > 1 ? `s · ${approval.emails.length}` : ""}
                  </FieldLabel>
                  <div className="space-y-3">
                    {approval.emails.map((e) => (
                      <EmailPreview key={e.id} email={e} />
                    ))}
                  </div>
                </div>
              )}

              {tool && (
                <div>
                  <FieldLabel>Held action</FieldLabel>
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line px-3.5 py-3 text-sm">
                    <span className="font-mono text-xs text-ink">{tool.name}</span>
                    {approval.action.calls.length > 1 && <span className="text-xs text-muted">× {approval.action.calls.length}</span>}
                    <span className="text-line-strong">·</span>
                    <PermissionBadge permission={tool.permission} />
                    <span className="ml-auto text-xs text-muted">Runs only after approval</span>
                  </div>
                </div>
              )}

              {approval.status !== "pending" && (
                <div className="flex items-center gap-2 text-sm text-ink-2">
                  <CheckCircle2 className="size-4 text-muted" />
                  {approval.status === "superseded"
                    ? approval.note
                    : `${approval.decidedBy} · ${approval.decidedAt ? relativeTime(approval.decidedAt) : ""}${approval.note ? ` — “${approval.note}”` : ""}`}
                </div>
              )}

              {noteOpen && (
                <div>
                  <FieldLabel>What should change?</FieldLabel>
                  <Textarea rows={3} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Keep the discount at 5% and extend validity to 30 days." />
                </div>
              )}
            </SheetBody>
            {approval.status === "pending" && (
              <SheetFooter className="justify-end">
                {processing ? (
                  <span className="flex h-8 items-center gap-2 text-sm text-muted">
                    <Loader2 className="size-3.5 animate-spin" /> Executing securely…
                  </span>
                ) : noteOpen ? (
                  <>
                    <Button variant="ghost" onClick={() => setNoteOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" disabled={!note.trim()} onClick={() => void act("changes")}>
                      Send request
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="mr-auto" onClick={() => setNoteOpen(true)}>
                      Request changes
                    </Button>
                    <Button variant="destructive" onClick={() => void act("reject")}>
                      Reject
                    </Button>
                    <Button variant="primary" onClick={() => void act("approve")}>
                      {approval.actionLabel}
                    </Button>
                  </>
                )}
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function ApprovalsView() {
  const approvals = useOperator((s) => s.approvals);
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [openId, setOpenId] = useState<string | null>(null);

  // Deep link: /approvals?id=APR-1045 opens the drawer.
  const deepLink = params.get("id");
  const [handled, setHandled] = useState<string | null>(null);
  if (deepLink && deepLink !== handled) {
    setHandled(deepLink);
    setOpenId(deepLink);
    const target = approvals.find((a) => a.id === deepLink);
    if (target && !inTab(tab, target.status)) setTab(target.status === "pending" ? "pending" : "all");
  }
  useEffect(() => {
    if (deepLink) router.replace("/approvals", { scroll: false });
  }, [deepLink, router]);

  const rows = approvals.filter((a) => inTab(tab, a.status));
  const count = (t: Tab) => approvals.filter((a) => inTab(t, a.status)).length;

  return (
    <>
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          {(["pending", "approved", "rejected", "all"] as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="tabular text-xs text-subtle">
                <span className="sr-only">(</span>
                {count(t)}
                <span className="sr-only">)</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-5 overflow-hidden rounded-xl border border-line">
        {rows.length === 0 ? (
          tab === "pending" ? (
            <EmptyState icon={CheckCircle2} title="No pending approvals" description="Everything that required review has been handled." />
          ) : (
            <EmptyState icon={Clock} title={`No ${tab} requests`} description="Decisions will appear here with who made them and when." />
          )
        ) : (
          <div className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {rows.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ApprovalCard approval={a} onOpen={() => setOpenId(a.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ApprovalDrawer approval={approvals.find((a) => a.id === openId)} onClose={() => setOpenId(null)} />
    </>
  );
}
