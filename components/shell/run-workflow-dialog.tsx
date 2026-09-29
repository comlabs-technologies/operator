"use client";

import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StepIcon } from "@/components/workflows/step-icon";
import { useWorkflowRun } from "@/components/workflows/use-workflow-run";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { workflows } from "@/lib/mock/workflows";
import { useOperator } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUI } from "./ui-store";

function RunWorkflowBody({ initialId }: { initialId: string | null }) {
  const close = useUI((s) => s.close);
  const status = useOperator((s) => s.workflowStatus);
  const [selected, setSelected] = useState(initialId ?? workflows[0].id);
  const workflow = workflows.find((w) => w.id === selected)!;
  const { run, start } = useWorkflowRun(workflow);
  const started = run.status !== "idle";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Run workflow</DialogTitle>
        <DialogDescription>Runs now with the same permissions and approvals as a scheduled run.</DialogDescription>
      </DialogHeader>

      {!started ? (
        <div role="radiogroup" className="space-y-1.5 px-5 py-4">
          {workflows.map((w) => (
            <button
              key={w.id}
              role="radio"
              aria-checked={selected === w.id}
              onClick={() => setSelected(w.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                selected === w.id ? "border-ink/60 bg-surface-muted" : "border-line hover:border-line-strong hover:bg-surface-muted",
              )}
            >
              <span className={cn("mt-1 grid size-3.5 shrink-0 place-items-center rounded-full border", selected === w.id ? "border-ink" : "border-line-strong")}>
                {selected === w.id && <span className="size-1.5 rounded-full bg-ink" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {w.name}
                  {status[w.id] === "paused" && <span className="text-2xs font-normal text-muted">Paused</span>}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {w.trigger} · {w.steps.length - 1} steps
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <ol className="px-5 py-4">
          {workflow.steps.map((step, i) => {
            const s = run.steps[step.id];
            return (
              <li key={step.id} className="relative flex gap-3 pb-3 last:pb-0">
                {i < workflow.steps.length - 1 && <span className="absolute top-7 bottom-0 left-[13.5px] w-px bg-line" />}
                <StepIcon kind={step.kind} state={s?.state ?? "idle"} />
                <div className="min-w-0 flex-1 pt-1">
                  <div className={cn("text-sm", s ? "text-ink" : "text-muted")}>{step.title}</div>
                  <div className="h-4 text-xs text-muted">{s?.state === "running" ? "Executing securely…" : s?.summary}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <DialogFooter className="justify-between">
        <span className="text-xs text-muted">
          {run.status === "running" && "Running…"}
          {run.status === "completed" && "Completed · recorded in Activity"}
          {run.status === "waiting" && `${run.approvalId} added to Approvals`}
          {run.status === "failed" && "Stopped by policy · see Activity"}
        </span>
        <div className="flex gap-2">
          {run.status === "waiting" ? (
            <Button variant="primary" asChild onClick={close}>
              <Link href={`/approvals?id=${run.approvalId}`}>
                Review approval <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : started ? (
            <Button onClick={close} disabled={run.status === "running"}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" onClick={start}>
                <Play className="size-3.5 fill-current" /> Run now
              </Button>
            </>
          )}
        </div>
      </DialogFooter>
    </>
  );
}

export function RunWorkflowDialog() {
  const overlay = useUI((s) => s.overlay);
  const close = useUI((s) => s.close);
  const initialId = useUI((s) => s.runWorkflowId);
  const open = overlay === "runWorkflow";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-[480px]">{open && <RunWorkflowBody key={initialId ?? "default"} initialId={initialId} />}</DialogContent>
    </Dialog>
  );
}
