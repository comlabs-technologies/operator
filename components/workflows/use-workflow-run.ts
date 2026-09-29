"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Workflow } from "@/lib/mock/workflows";
import { runWorkflow, type StepState } from "@/lib/runtime/workflows";
import { useOperator } from "@/lib/store";

export interface RunState {
  status: "idle" | "running" | "completed" | "waiting" | "failed";
  steps: Record<string, { state: StepState; summary?: string }>;
  approvalId?: string;
}

export function useWorkflowRun(workflow: Workflow | undefined) {
  const [run, setRun] = useState<RunState>({ status: "idle", steps: {} });
  const hooks = useOperator((s) => s.hooks);
  const requestApproval = useOperator((s) => s.requestApproval);
  const recordWorkflowRun = useOperator((s) => s.recordWorkflowRun);

  const start = useCallback(async () => {
    if (!workflow) return;
    setRun({ status: "running", steps: {} });
    let approvalId: string | undefined;
    const covered = useOperator
      .getState()
      .approvals.filter((a) => a.status === "pending" || a.status === "approved")
      .flatMap((a) => a.covers ?? []);
    const result = await runWorkflow(workflow, hooks(), {
      covered,
      onStep: (id, state, summary) => setRun((r) => ({ ...r, steps: { ...r.steps, [id]: { state, summary } } })),
      requestApproval: (input) => {
        const approval = requestApproval(input);
        approvalId = approval.id;
        return approval;
      },
    });
    recordWorkflowRun(workflow.id);
    const status = result.completed ? "completed" : result.waiting ? "waiting" : "failed";
    setRun((r) => ({ ...r, status, approvalId }));
    if (status === "completed") toast.success(`${workflow.name} completed`);
    if (status === "waiting") toast(`${workflow.name} is waiting for approval`, { description: `${approvalId} was added to Approvals.` });
  }, [workflow, hooks, requestApproval, recordWorkflowRun]);

  const reset = useCallback(() => setRun({ status: "idle", steps: {} }), []);

  return { run, start, reset };
}
