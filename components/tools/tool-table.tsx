"use client";

import { Wrench } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PermissionBadge, RiskBadge, StatusBadge, TypeBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput, Segmented } from "@/components/shared/segmented";
import { listTools } from "@/lib/mcp/registry";
import type { ToolDefinition } from "@/lib/mcp/types";
import { useOperator } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { ToolDrawer } from "./tool-drawer";

type Filter = "all" | "read" | "write" | "approval" | "restricted";

const matches = (t: ToolDefinition, f: Filter) =>
  f === "all" ||
  (f === "read" && t.type === "read") ||
  (f === "write" && t.type === "write") ||
  (f === "approval" && (t.status === "approval_required" || t.approval.mode !== "never")) ||
  (f === "restricted" && (t.status === "restricted" || t.status === "disabled"));

const tools = [...listTools()].sort((a, b) => b.executions - a.executions);

export function ToolTable({ connection }: { connection?: string }) {
  const connections = useOperator((s) => s.connections);
  const activity = useOperator((s) => s.activity);
  const params = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const deepLink = connection ? null : params.get("tool");
  const [handled, setHandled] = useState<string | null>(null);
  if (deepLink && deepLink !== handled) {
    setHandled(deepLink);
    setOpenId(deepLink);
  }
  useEffect(() => {
    if (deepLink) router.replace("/tools", { scroll: false });
  }, [deepLink, router]);

  const sessionRuns = (id: string) => activity.filter((e) => e.toolId === id && !e.id.startsWith("evt_seed")).length;
  const scoped = tools.filter((t) => !connection || t.connection === connection);
  const q = query.toLowerCase();
  const rows = scoped.filter((t) => matches(t, filter) && (!q || t.name.includes(q) || t.permission.includes(q) || t.connection.includes(q)));

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: scoped.length },
            { value: "read", label: "Read" },
            { value: "write", label: "Write" },
            { value: "approval", label: "Requires approval" },
            { value: "restricted", label: "Restricted" },
          ]}
          className="max-w-full overflow-x-auto"
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search tools" className="sm:w-64" />
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <DataTable<ToolDefinition>
          rows={rows}
          rowKey={(t) => t.id}
          selectedKey={openId}
          onRowClick={(t) => setOpenId(t.id)}
          minWidth={900}
          columns={[
            { key: "tool", header: "Tool", cell: (t) => <span className="font-mono text-xs font-medium text-ink">{t.name}</span> },
            {
              key: "connection",
              header: "Connection",
              cell: (t) => {
                const c = connections.find((c) => c.id === t.connection);
                return (
                  <span className="flex items-center gap-2 text-ink-2">
                    {c && <ConnectionIcon kind={c.kind} size="sm" />}
                    {c?.shortName}
                  </span>
                );
              },
            },
            { key: "type", header: "Type", cell: (t) => <TypeBadge type={t.type} /> },
            { key: "permission", header: "Permission", cell: (t) => <PermissionBadge permission={t.permission} /> },
            { key: "executions", header: "Executions", align: "right", cell: (t) => formatNumber(t.executions + sessionRuns(t.id)) },
            { key: "risk", header: "Risk", cell: (t) => <RiskBadge risk={t.risk} /> },
            { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
          ]}
          empty={<EmptyState icon={Wrench} title="No tools match" description="Try a different filter or search term." />}
        />
      </div>
      <ToolDrawer tool={tools.find((t) => t.id === openId)} onClose={() => setOpenId(null)} />
    </>
  );
}
