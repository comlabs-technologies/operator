"use client";

import { ScrollText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ActorMark, actorLabel } from "@/components/overview/activity-feed";
import { ResultBadge } from "@/components/shared/badges";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput, Segmented } from "@/components/shared/segmented";
import type { AuditEvent, ExecutionResult } from "@/lib/mcp/types";
import { useOperator } from "@/lib/store";
import { formatDuration, logTime } from "@/lib/utils";
import { ExecutionDrawer } from "./execution-drawer";

type Filter = "all" | ExecutionResult;

export function ActivityView({ filterConnection, filterAgent, compact }: { filterConnection?: string; filterAgent?: string; compact?: boolean }) {
  const activity = useOperator((s) => s.activity);
  const params = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const deepLink = params.get("event");
  const [handled, setHandled] = useState<string | null>(null);
  if (!compact && deepLink && deepLink !== handled) {
    setHandled(deepLink);
    setOpenId(deepLink);
  }
  useEffect(() => {
    if (!compact && deepLink) router.replace("/activity", { scroll: false });
  }, [compact, deepLink, router]);

  const scoped = activity.filter(
    (e) =>
      (!filterConnection || e.connection === filterConnection) &&
      (!filterAgent || (e.actor.type === "agent" && e.actor.agentId === filterAgent) || (e.actor.type === "workflow" && e.actor.agentId === filterAgent)),
  );
  const q = query.toLowerCase();
  const rows = scoped.filter(
    (e) =>
      (filter === "all" || e.result === filter) &&
      (!q || [e.action, e.resource, actorLabel(e), e.summary].some((v) => v.toLowerCase().includes(q))),
  );
  const count = (f: Filter) => scoped.filter((e) => f === "all" || e.result === f).length;

  return (
    <>
      {!compact && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: count("all") },
              { value: "success", label: "Success", count: count("success") },
              { value: "pending_approval", label: "Awaiting approval", count: count("pending_approval") },
              { value: "blocked", label: "Blocked", count: count("blocked") },
            ]}
            className="max-w-full overflow-x-auto"
          />
          <SearchInput value={query} onChange={setQuery} placeholder="Filter by action, resource or principal" className="sm:w-72" />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-line">
        <DataTable<AuditEvent>
          rows={rows}
          rowKey={(e) => e.id}
          selectedKey={openId}
          onRowClick={(e) => setOpenId(e.id)}
          minWidth={820}
          columns={[
            { key: "time", header: "Time", cell: (e) => <span className="tabular text-ink-2">{logTime(e.timestamp)}</span>, className: "w-[110px]" },
            {
              key: "actor",
              header: "User / Agent",
              cell: (e) => (
                <span className="flex items-center gap-2">
                  <ActorMark event={e} />
                  <span className="truncate">{actorLabel(e)}</span>
                </span>
              ),
            },
            { key: "action", header: "Action", cell: (e) => <span className="font-mono text-xs text-ink">{e.action}</span> },
            { key: "resource", header: "Resource", cell: (e) => <span className="text-ink-2">{e.resource}</span> },
            { key: "result", header: "Result", cell: (e) => <ResultBadge result={e.result} /> },
            { key: "duration", header: "Duration", align: "right", cell: (e) => <span className="text-ink-2">{formatDuration(e.durationMs)}</span> },
          ]}
          empty={<EmptyState icon={ScrollText} title="No matching executions" description="Every tool call, approval and blocked attempt is recorded here." />}
        />
      </div>
      <ExecutionDrawer event={activity.find((e) => e.id === openId)} onClose={() => setOpenId(null)} />
    </>
  );
}
