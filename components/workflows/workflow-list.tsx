"use client";

import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { useUI } from "@/components/shell/ui-store";
import { StatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getAgent } from "@/lib/mock/agents";
import { workflows } from "@/lib/mock/workflows";
import { useOperator } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { StepIcon } from "./step-icon";

export function WorkflowList() {
  const status = useOperator((s) => s.workflowStatus);
  const runs = useOperator((s) => s.workflowRuns);
  const toggle = useOperator((s) => s.toggleWorkflow);
  const open = useUI((s) => s.open);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {workflows.map((w) => (
        <div key={w.id} className="group relative grid gap-4 px-4 py-4 transition-colors hover:bg-surface-muted sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/workflows/${w.id}`} className="text-[15px] font-medium text-ink after:absolute after:inset-0">
                {w.name}
              </Link>
              <StatusBadge status={status[w.id]} />
            </div>
            <div className="text-sm text-muted">
              <span className="text-ink-2">Trigger:</span> {w.trigger} · {getAgent(w.agentId)?.name}
            </div>
            <ol className="flex flex-wrap items-center gap-1 pt-1">
              {w.steps.slice(1).map((s, i) => (
                <li key={s.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3 text-subtle" />}
                  <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-line bg-surface pr-2 text-xs text-ink-2">
                    <StepIcon kind={s.kind} className="size-[22px] border-0 bg-transparent [&_svg]:size-3" />
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="text-right">
              <div className="tabular text-sm text-ink">{formatNumber(w.executions + (runs[w.id] ?? 0))}</div>
              <div className="text-2xs text-muted">executions</div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-sm text-ink">{runs[w.id] ? "Just now" : w.lastRun}</div>
              <div className="text-2xs text-muted">last run</div>
            </div>
            <Switch checked={status[w.id] === "active"} onCheckedChange={() => toggle(w.id)} aria-label={`${w.name} active`} />
            <Button size="sm" onClick={() => open("runWorkflow", w.id)}>
              <Play className="fill-current" /> Run
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
