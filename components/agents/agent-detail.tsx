"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ActivityView } from "@/components/activity/activity-view";
import { DailyColumns } from "@/components/analytics/charts";
import { AccessBadge, PermissionBadge, RiskBadge, StatusBadge, TypeBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { DataTable } from "@/components/shared/data-table";
import { DetailList, FieldLabel } from "@/components/shared/detail-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dailyExecutions } from "@/lib/mock/analytics";
import { agentToolCounts, getAgent } from "@/lib/mock/agents";
import { getConnection } from "@/lib/mock/connections";
import { toolsForAgent, type AgentTool } from "@/lib/runtime/tools";
import { useOperator } from "@/lib/store";
import { formatNumber, relativeTime } from "@/lib/utils";
import { ToolAccessBar } from "./agent-card";

function Instructions({ agentId }: { agentId: string }) {
  const saved = useOperator((s) => s.instructions[agentId]);
  const save = useOperator((s) => s.saveInstructions);
  const [draft, setDraft] = useState(saved.text);
  const dirty = draft !== saved.text;

  return (
    <div className="grid gap-6 pt-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-3">
        <Textarea rows={9} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Agent instructions" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {saved.editedAt ? `Edited by Pawan · ${relativeTime(saved.editedAt)}` : "Version 4 · edited by Priya Nair on 18 Sep"}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(saved.text)}>
              Discard
            </Button>
            <Button
              variant="primary"
              disabled={!dirty || !draft.trim()}
              onClick={() => {
                save(agentId, draft);
                toast.success("Instructions saved", { description: "Applies to the next run. Tool permissions are unchanged." });
              }}
            >
              Save instructions
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-line bg-surface-muted px-4 py-3.5 text-xs leading-5 text-muted">
        <div className="mb-1.5 font-medium text-ink-2">Instructions guide behaviour; policies enforce it.</div>
        Limits such as approval thresholds and blocked tools are enforced by the permission layer on every call, even if the instructions change.
      </div>
    </div>
  );
}

export function AgentDetail({ id }: { id: string }) {
  const agent = getAgent(id)!;
  const tools = toolsForAgent(id);
  const counts = agentToolCounts(agent);
  const share = agent.executions / dailyExecutions.reduce((s, d) => s + d.executions, 0);
  const usage = dailyExecutions.map((d, i) => ({ label: d.label, executions: agent.usage[i] ?? Math.round(d.executions * share) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-[-0.015em] text-ink">{agent.name}</h1>
            <StatusBadge status={agent.status} />
          </div>
          <p className="max-w-2xl text-sm text-muted">{agent.purpose}</p>
        </div>
        <div className="text-xs text-muted sm:text-right">
          Owner · {agent.owner}
          <br />
          {agent.schedule ? `Scheduled · ${agent.schedule}` : "On demand and via workflows"}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">
            Tools <span className="text-xs text-subtle">{counts.total}</span>
          </TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-5">
          <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line lg:grid-cols-4">
            {[
              { label: "Executions this month", value: formatNumber(agent.executions) },
              { label: "Success rate", value: `${agent.successRate}%` },
              { label: "Last run", value: agent.lastRun },
              { label: "Tools", value: `${counts.total} · ${counts.approval} need approval` },
            ].map((m, i) => (
              <div key={m.label} className={"space-y-1.5 px-5 py-3.5 " + (i % 2 ? "border-l border-line " : "") + (i >= 2 ? "border-line max-lg:border-t lg:border-l" : "")}>
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd className="tabular text-[15px] text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-xl border border-line px-5 pt-4 pb-3">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-medium text-ink">Executions per day</h2>
                <span className="text-xs text-muted">Last 30 days</span>
              </div>
              <DailyColumns data={usage} dataKey="executions" labelKey="label" unit="executions" height={200} />
            </section>
            <section className="space-y-5">
              <div>
                <FieldLabel>Connected systems</FieldLabel>
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {agent.connections.map((cid) => {
                    const c = getConnection(cid)!;
                    return (
                      <li key={cid}>
                        <Link href={`/connections/${cid}`} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-surface-muted">
                          <ConnectionIcon kind={c.kind} size="sm" />
                          <span className="flex-1">{c.name}</span>
                          <span className="text-xs text-muted">{tools.filter((t) => t.connection === cid).length} tools</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <FieldLabel>Tool access</FieldLabel>
                <ToolAccessBar agent={agent} />
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="pt-5">
          <div className="overflow-hidden rounded-xl border border-line">
            <DataTable<AgentTool>
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
                { key: "conn", header: "Connection", cell: (t) => <span className="text-ink-2">{getConnection(t.connection)?.shortName}</span> },
                { key: "type", header: "Type", cell: (t) => <TypeBadge type={t.type} /> },
                { key: "perm", header: "Permission", cell: (t) => <PermissionBadge permission={t.permission} /> },
                { key: "risk", header: "Risk", cell: (t) => <RiskBadge risk={t.risk} /> },
                { key: "access", header: "Access", cell: (t) => <AccessBadge access={t.access} /> },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="instructions">
          <Instructions agentId={id} />
        </TabsContent>

        <TabsContent value="permissions" className="grid gap-6 pt-5 lg:grid-cols-2">
          <div>
            <FieldLabel>Guardrails</FieldLabel>
            <DetailList items={agent.guardrails.map((g) => ({ label: g.label, value: g.value }))} />
          </div>
          <div className="space-y-4">
            {(["allowed", "approval", "blocked"] as const).map((level) => {
              const list = tools.filter((t) => t.access === level);
              if (!list.length) return null;
              return (
                <div key={level}>
                  <FieldLabel className="flex items-center gap-2">
                    <AccessBadge access={level} /> {list.length}
                  </FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((t) => (
                      <span key={t.id} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 font-mono text-[11px] text-ink-2">
                        {level === "allowed" && <Check className="size-3 text-green" />}
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="pt-5">
          <ActivityView compact filterAgent={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
