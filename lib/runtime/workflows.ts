import { executeTool } from "@/lib/mcp/gateway";
import type { Approval } from "@/lib/mock/approvals";
import { emailCall } from "@/lib/mock/approvals";
import { overdueInvoices } from "@/lib/mock/company";
import { paymentReminder } from "@/lib/mock/emails";
import type { Workflow } from "@/lib/mock/workflows";
import { formatINR, sleep } from "@/lib/utils";
import type { RuntimeHooks } from "./execute";

export type StepState = "idle" | "running" | "done" | "waiting" | "blocked";

export interface WorkflowRunHandlers {
  onStep: (stepId: string, state: StepState, summary?: string) => void;
  requestApproval: (input: Omit<Approval, "id" | "createdAt" | "status">) => Approval;
  /** Invoice or customer references already covered by a pending or approved request. */
  covered: string[];
}

/** Approval request raised by the approval step of a workflow. */
function approvalFor(workflow: Workflow, covered: string[]): Omit<Approval, "id" | "createdAt" | "status"> | null {
  if (workflow.id !== "overdue-invoice-follow-up") return null;
  // Invoices over 30 days without a reminder already pending or approved.
  const due = overdueInvoices.filter((i) => !covered.includes(i.id));
  if (!due.length) return null;
  const emails = due.map(paymentReminder);
  return {
    kind: "payment_reminder",
    title: "Payment reminders",
    subject: `${due.length} customers`,
    reference: due.map((i) => i.id).join(", "),
    amount: due.reduce((s, i) => s + i.amount, 0),
    detail: `${Math.min(...due.map((i) => i.daysOverdue))}–${Math.max(...due.map((i) => i.daysOverdue))} days overdue`,
    requestedBy: "Overdue Invoice Follow-up",
    agentId: workflow.agentId,
    reason: "Every outbound customer email is reviewed before it is sent.",
    actionLabel: "Approve & send",
    action: { toolId: "gmail.send_email", calls: emails.map(emailCall) },
    context: due.map((i) => ({ label: i.id, value: formatINR(i.amount), hint: `${i.daysOverdue} days overdue` })),
    emails,
    covers: due.map((i) => i.id),
  };
}

/** Runs a workflow step by step through the same gateway agents use. */
export async function runWorkflow(workflow: Workflow, hooks: RuntimeHooks, handlers: WorkflowRunHandlers) {
  let waiting = false;
  const request = approvalFor(workflow, handlers.covered);
  const reminders = workflow.id === "overdue-invoice-follow-up";
  if (reminders && !request) {
    handlers.onStep(workflow.steps[0].id, "running");
    await sleep(450);
    handlers.onStep(workflow.steps[0].id, "done", "No invoices due for a reminder");
    return { completed: true, waiting: false };
  }
  const n = request?.emails?.length ?? 0;
  for (const step of workflow.steps) {
    if (waiting) {
      handlers.onStep(step.id, "waiting", "Waiting for approval");
      continue;
    }
    handlers.onStep(step.id, "running");

    if (step.kind === "approval") {
      await sleep(450);
      if (request) {
        const approval = handlers.requestApproval(request);
        handlers.onStep(step.id, "waiting", `${approval.id} awaiting decision`);
        waiting = true;
        continue;
      }
    }

    if (step.toolId && step.input) {
      const execution = await executeTool(step.toolId, step.input, {
        actor: { type: "workflow", name: workflow.name, workflowId: workflow.id, agentId: workflow.agentId },
        agentId: workflow.agentId,
        audit: hooks.audit,
      });
      if (execution.result === "blocked" || execution.result === "failed") {
        handlers.onStep(step.id, "blocked", execution.reason);
        return { completed: false };
      }
      handlers.onStep(
        step.id,
        "done",
        step.kind === "tool" || step.kind === "notify" ? execution.summary : reminders ? `Prepared ${n} drafts` : step.runSummary,
      );
      continue;
    }

    await sleep(step.kind === "generate" ? 800 : 350);
    handlers.onStep(step.id, "done", reminders && step.kind === "trigger" ? `${n} invoices matched` : step.runSummary);
  }
  return { completed: !waiting, waiting };
}
