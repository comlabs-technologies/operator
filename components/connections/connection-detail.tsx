"use client";

import { KeyRound, PlugZap, RefreshCw, Wrench } from "lucide-react";
import Link from "next/link";
import { ActivityView } from "@/components/activity/activity-view";
import { AccessBadge, RiskBadge, StatusBadge, TypeBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { DataTable } from "@/components/shared/data-table";
import { DetailList, FieldLabel } from "@/components/shared/detail-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toolsForConnection } from "@/lib/mcp/registry";
import type { ToolDefinition } from "@/lib/mcp/types";
import { agents } from "@/lib/mock/agents";
import { useOperator } from "@/lib/store";
import { formatNumber, sleep } from "@/lib/utils";

function approvalLabel(t: ToolDefinition) {
  if (t.status === "disabled") return <span className="text-muted">Disabled</span>;
  if (t.approval.mode === "always") return <Badge tone="amber">Always</Badge>;
  if (t.approval.mode === "conditional") return <Badge tone="amber">Conditional</Badge>;
  return <span className="text-muted">Not required</span>;
}

export function ConnectionDetail({ id }: { id: string }) {
  const connection = useOperator((s) => s.connections.find((c) => c.id === id));
  const updateConnection = useOperator((s) => s.updateConnection);
  const activity = useOperator((s) => s.activity);

  if (!connection) {
    return <EmptyState icon={PlugZap} title="Connection not found" description="It may have been removed, or the demo was reset." action={<Button asChild><Link href="/connections">Back to connections</Link></Button>} />;
  }

  const tools = toolsForConnection(connection.id);
  const sessionRuns = (tid: string) => activity.filter((e) => e.toolId === tid && !e.id.startsWith("evt_seed")).length;
  const usedBy = agents.filter((a) => a.connections.includes(connection.id));

  const sync = async () => {
    updateConnection(connection.id, { status: "syncing" });
    await sleep(1600);
    updateConnection(connection.id, { status: "connected", lastSynced: "just now", lastActivity: "just now" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <ConnectionIcon kind={connection.kind} size="lg" />
          <div>
            <h1 className="text-xl font-medium tracking-[-0.015em] text-ink">{connection.name}</h1>
            <p className="text-sm text-muted">{connection.description}</p>
          </div>
        </div>
        <Button onClick={sync} disabled={connection.status === "syncing"}>
          <RefreshCw className={connection.status === "syncing" ? "size-3.5 animate-spin" : "size-3.5"} />
          {connection.status === "syncing" ? "Syncing…" : "Sync now"}
        </Button>
      </div>

      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line lg:grid-cols-4">
        {[
          { label: "Status", value: <StatusBadge status={connection.status} /> },
          { label: "Authentication", value: connection.auth },
          { label: "Tools", value: connection.status === "syncing" && !connection.toolCount ? "Discovering…" : connection.toolCount },
          { label: "Last activity", value: connection.lastActivity },
        ].map((m, i) => (
          <div key={m.label} className={"space-y-1.5 px-5 py-3.5 " + (i % 2 ? "border-l border-line " : "") + (i >= 2 ? "max-lg:border-t lg:border-l border-line" : "")}>
            <dt className="text-xs text-muted">{m.label}</dt>
            <dd className="tabular text-[15px] text-ink">{m.value}</dd>
          </div>
        ))}
      </dl>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">
            Tools <span className="text-xs text-subtle">{tools.length}</span>
          </TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-6 pt-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <DetailList
            items={[
              { label: "Endpoint", value: <span className="font-mono text-xs break-all">{connection.endpoint}</span> },
              { label: "Access", value: connection.access },
              { label: "Sync", value: `${connection.syncSchedule} · last ${connection.lastSynced}` },
              { label: "Owner", value: connection.owner },
              { label: "Used by", value: usedBy.length ? usedBy.map((a) => a.name).join(", ") : "No agents yet" },
            ]}
          />
          <div className="space-y-5">
            {connection.objects.length > 0 && (
              <div>
                <FieldLabel>Objects exposed</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {connection.objects.map((o) => (
                    <Badge key={o} tone="outline">{o}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-muted px-3.5 py-3 text-xs leading-5 text-muted">
              <KeyRound className="mt-0.5 size-3.5 shrink-0" />
              {connection.auth} credentials are stored in the gateway vault. Agents see tools, never keys.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="pt-5">
          <div className="overflow-hidden rounded-xl border border-line">
            <DataTable<ToolDefinition>
              rows={tools}
              rowKey={(t) => t.id}
              minWidth={760}
              columns={[
                {
                  key: "name",
                  header: "Tool",
                  cell: (t) => (
                    <Link href={`/tools?tool=${t.id}`} className="font-mono text-xs font-medium text-ink hover:underline">
                      {t.name}
                    </Link>
                  ),
                },
                { key: "type", header: "Access", cell: (t) => <TypeBadge type={t.type} /> },
                { key: "usage", header: "Usage", align: "right", cell: (t) => formatNumber(t.executions + sessionRuns(t.id)) },
                { key: "risk", header: "Risk", cell: (t) => <RiskBadge risk={t.risk} /> },
                { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
                { key: "approval", header: "Approval", cell: approvalLabel },
              ]}
              empty={<EmptyState icon={Wrench} title={connection.toolCount ? `${connection.toolCount} operations awaiting review` : "Discovering operations"} description="Discovered operations are registered as disabled tools until an admin reviews their permission and risk." />}
            />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 pt-5">
          <div>
            <FieldLabel>Scopes granted to Operator</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {connection.scopes.map((s) => (
                <code key={s} className="rounded-[4px] bg-surface-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-2">{s}</code>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Agent access</FieldLabel>
            {usedBy.length ? (
              <div className="scrollbar-thin overflow-x-auto rounded-xl border border-line">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="h-9 px-4 text-left text-xs font-normal text-muted">Tool</th>
                      {usedBy.map((a) => (
                        <th key={a.id} className="h-9 px-3 text-left text-xs font-normal text-muted">{a.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tools
                      .filter((t) => usedBy.some((a) => a.tools[t.id]))
                      .map((t) => (
                        <tr key={t.id} className="border-b border-line last:border-0">
                          <td className="h-10 px-4 font-mono text-xs text-ink">{t.name}</td>
                          {usedBy.map((a) => (
                            <td key={a.id} className="px-3">
                              {a.tools[t.id] ? <AccessBadge access={a.tools[t.id]} /> : <span className="text-subtle">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-lg border border-line px-3.5 py-3 text-sm text-muted">No agent has tools from this connection yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="pt-5">
          <ActivityView compact filterConnection={connection.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
