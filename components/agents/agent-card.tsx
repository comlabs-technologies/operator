import { ArrowUpRight, CalendarClock, Eye } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { Sparkline } from "@/components/shared/sparkline";
import { Badge } from "@/components/ui/badge";
import { agentToolCounts, type AgentDefinition } from "@/lib/mock/agents";
import { getConnection } from "@/lib/mock/connections";
import { formatNumber } from "@/lib/utils";

export function ToolAccessBar({ agent }: { agent: AgentDefinition }) {
  const c = agentToolCounts(agent);
  return (
    <div className="space-y-1.5">
      <div className="flex h-1.5 gap-[2px] overflow-hidden rounded-full">
        <span className="bg-green/70" style={{ flex: c.allowed }} />
        {c.approval > 0 && <span className="bg-amber/80" style={{ flex: c.approval }} />}
        {c.blocked > 0 && <span className="bg-red/70" style={{ flex: c.blocked }} />}
      </div>
      <div className="flex flex-wrap gap-x-3 text-2xs text-muted">
        <span>{c.allowed} allowed</span>
        {c.approval > 0 && <span>{c.approval} approval required</span>}
        {c.blocked > 0 && <span>{c.blocked} blocked</span>}
      </div>
    </div>
  );
}

export function AgentCard({ agent }: { agent: AgentDefinition }) {
  const counts = agentToolCounts(agent);
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-sm"
    >
      <div className="space-y-3 px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-medium text-ink">{agent.name}</h2>
            <StatusBadge status={agent.status} />
            {agent.readOnly && (
              <Badge tone="outline">
                <Eye /> Read-only
              </Badge>
            )}
            {agent.schedule && (
              <Badge tone="outline">
                <CalendarClock /> {agent.schedule}
              </Badge>
            )}
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="text-sm leading-[21px] text-muted">{agent.purpose}</p>
        <div className="flex items-center gap-1.5">
          {agent.connections.map((id) => {
            const c = getConnection(id)!;
            return (
              <span key={id} className="inline-flex h-6 items-center gap-1.5 rounded-md border border-line px-1.5 pr-2 text-xs text-ink-2">
                <ConnectionIcon kind={c.kind} size="sm" className="border-0 shadow-none" />
                {c.shortName}
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-auto grid grid-cols-[1fr_1fr_1.2fr] border-t border-line">
        <div className="px-5 py-3">
          <div className="text-2xs text-muted">Tools</div>
          <div className="tabular mt-0.5 text-sm text-ink">{counts.total}</div>
        </div>
        <div className="border-l border-line px-5 py-3">
          <div className="text-2xs text-muted">Executions this month</div>
          <div className="tabular mt-0.5 text-sm text-ink">{formatNumber(agent.executions)}</div>
        </div>
        <div className="border-l border-line px-5 py-3">
          <Sparkline values={agent.usage} className="h-8" />
        </div>
      </div>
      <div className="border-t border-line px-5 py-3">
        <ToolAccessBar agent={agent} />
      </div>
    </Link>
  );
}
