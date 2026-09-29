"use client";

import { Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PermissionBadge, StatusBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { DetailList, FieldLabel } from "@/components/shared/detail-list";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { getTool } from "@/lib/mcp/registry";
import { getAgent } from "@/lib/mock/agents";
import { getConnection } from "@/lib/mock/connections";
import type { Workflow, WorkflowStep } from "@/lib/mock/workflows";
import { useOperator } from "@/lib/store";
import { cn, formatNumber } from "@/lib/utils";
import { kindLabel, StepIcon } from "./step-icon";
import { useWorkflowRun, type RunState } from "./use-workflow-run";

function Block({ step, run, selected, onClick }: { step: WorkflowStep; run: RunState; selected: boolean; onClick: () => void }) {
  const tool = step.toolId ? getTool(step.toolId)?.definition : undefined;
  const conn = tool ? getConnection(tool.connection) : undefined;
  const s = run.steps[step.id];
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3.5 rounded-xl border bg-surface px-4 py-3 text-left transition-[border-color,box-shadow] duration-150",
        selected ? "border-ink/40 shadow-sm" : "border-line hover:border-line-strong hover:shadow-xs",
        step.kind === "approval" && !s && "border-dashed border-amber-line",
      )}
    >
      <StepIcon kind={step.kind} state={s?.state ?? "idle"} />
      <div className="min-w-0 flex-1">
        <div className="text-2xs font-medium text-subtle uppercase tracking-wide">{kindLabel[step.kind]}</div>
        <div className="text-sm font-medium text-ink">{step.title}</div>
        <div className="truncate text-xs text-muted">
          {s?.state === "running" ? "Executing securely…" : s?.summary ?? step.description}
        </div>
      </div>
      {tool && conn && (
        <span className="hidden shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2 py-1 font-mono text-[11px] text-ink-2 sm:inline-flex">
          <ConnectionIcon kind={conn.kind} size="sm" className="size-4 border-0 bg-transparent shadow-none" />
          {tool.name}
        </span>
      )}
    </button>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="flex h-6 justify-center" aria-hidden>
      <span className={cn("w-px transition-colors duration-300", active ? "bg-ink-2" : "bg-line-strong")} />
    </div>
  );
}

export function WorkflowDetail({ workflow }: { workflow: Workflow }) {
  const status = useOperator((s) => s.workflowStatus[workflow.id]);
  const runs = useOperator((s) => s.workflowRuns[workflow.id] ?? 0);
  const toggle = useOperator((s) => s.toggleWorkflow);
  const { run, start, reset } = useWorkflowRun(workflow);
  const [selected, setSelected] = useState<WorkflowStep | null>(null);
  const agent = getAgent(workflow.agentId);
  const selectedTool = selected?.toolId ? getTool(selected.toolId)?.definition : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-[-0.015em] text-ink">{workflow.name}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="max-w-2xl text-sm text-muted">{workflow.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <Switch checked={status === "active"} onCheckedChange={() => toggle(workflow.id)} /> Active
          </label>
          {run.status !== "idle" && run.status !== "running" && (
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="size-3.5" /> Clear run
            </Button>
          )}
          <Button variant="primary" onClick={start} disabled={run.status === "running"}>
            <Play className="size-3.5 fill-current" /> {run.status === "running" ? "Running…" : "Run now"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-xl border border-line bg-surface-muted bg-[radial-gradient(var(--line)_1px,transparent_1px)] [background-size:16px_16px] px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-[520px]">
            {workflow.steps.map((step, i) => (
              <div key={step.id}>
                {i > 0 && <Connector active={!!run.steps[step.id]} />}
                <Block step={step} run={run} selected={selected?.id === step.id} onClick={() => setSelected(step)} />
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <DetailList
            items={[
              { label: "Trigger", value: workflow.trigger },
              { label: "Runs as", value: agent ? <Link href={`/agents/${agent.id}`} className="hover:underline">{agent.name}</Link> : "—" },
              { label: "Executions", value: <span className="tabular">{formatNumber(workflow.executions + runs)}</span> },
              { label: "Success rate", value: `${workflow.successRate}%` },
              { label: "Avg. duration", value: workflow.avgDuration },
              { label: "Last run", value: runs ? "Just now" : workflow.lastRun },
            ]}
          />
          {run.status === "waiting" && run.approvalId && (
            <div className="rounded-lg border border-amber-line bg-amber-bg px-3.5 py-3 text-sm text-amber">
              Paused at approval.{" "}
              <Link href={`/approvals?id=${run.approvalId}`} className="font-medium underline underline-offset-2">
                Review {run.approvalId}
              </Link>
            </div>
          )}
          {run.status === "completed" && <div className="rounded-lg border border-green-line bg-green-bg px-3.5 py-3 text-sm text-green">Run completed · recorded in Activity</div>}
          <p className="text-xs leading-5 text-muted">Select a step to see its configuration. Each tool step runs through the gateway with the permissions of {agent?.name}.</p>
        </aside>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <div className="mb-1.5 flex items-center gap-2">
                  <StepIcon kind={selected.kind} className="size-6 [&_svg]:size-3" />
                  <span className="text-xs text-muted">{kindLabel[selected.kind]} step</span>
                </div>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>{selected.description}</SheetDescription>
              </SheetHeader>
              <SheetBody className="space-y-6">
                <div>
                  <FieldLabel>Configuration</FieldLabel>
                  <DetailList items={selected.config.map((c) => ({ label: c.label, value: <span className="font-mono text-xs">{c.value}</span> }))} />
                </div>
                {selectedTool && (
                  <div>
                    <FieldLabel>Tool</FieldLabel>
                    <DetailList
                      items={[
                        { label: "Tool", value: <Link href={`/tools?tool=${selectedTool.id}`} className="font-mono text-xs hover:underline">{selectedTool.name}</Link> },
                        { label: "Connection", value: getConnection(selectedTool.connection)?.name },
                        { label: "Permission", value: <PermissionBadge permission={selectedTool.permission} /> },
                        { label: "Approval policy", value: <span className="text-ink-2">{selectedTool.approval.description}</span> },
                      ]}
                    />
                  </div>
                )}
                <div>
                  <FieldLabel>Last run</FieldLabel>
                  <p className="rounded-lg border border-line px-3.5 py-3 text-sm text-ink-2">{run.steps[selected.id]?.summary ?? selected.runSummary}</p>
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
