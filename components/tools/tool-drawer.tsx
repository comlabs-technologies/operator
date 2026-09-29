"use client";

import { Loader2, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccessBadge, PermissionBadge, ResultBadge, RiskBadge, StatusBadge, TypeBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { DetailList, FieldLabel } from "@/components/shared/detail-list";
import { JsonBlock } from "@/components/shared/json-block";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { executeTool } from "@/lib/mcp/gateway";
import type { ToolDefinition, ToolExecution } from "@/lib/mcp/types";
import { agentsForTool } from "@/lib/runtime/tools";
import { useOperator } from "@/lib/store";
import { formatDuration, formatNumber, logTime } from "@/lib/utils";

const samples: Record<string, Record<string, unknown>> = {
  "hubspot.search_customer": { query: "Tata Engineering" },
  "erp.check_inventory": { sku: "MX-GB-220" },
  "erp.get_outstanding_invoices": { min_days_overdue: 45 },
  "erp.get_customer": { customer_id: "c_tata" },
  "erp.get_invoice": { invoice_id: "INV-318" },
  "erp.get_stock_forecast": { sku: "MX-GB-220", horizon_days: 14 },
  "erp.get_revenue_summary": { period: "month" },
  "hubspot.get_deals": { inactive_days: 10 },
  "postgres.get_receivables_aging": { as_of: "2026-09-29" },
  "drive.find_document": { query: "Tata rate contract 2026" },
};

function sampleInput(tool: ToolDefinition) {
  if (samples[tool.id]) return samples[tool.id];
  return Object.fromEntries(
    Object.entries(tool.inputSchema.properties)
      .filter(([k]) => tool.inputSchema.required?.includes(k))
      .map(([k, p]) => [k, p.type === "string" ? (p.enum?.[0] ?? "sample") : p.type === "boolean" ? true : p.type === "array" ? [] : 1]),
  );
}

function TestRunner({ tool }: { tool: ToolDefinition }) {
  const recordEvent = useOperator((s) => s.recordEvent);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ToolExecution>();
  const input = sampleInput(tool);

  const run = async () => {
    setRunning(true);
    setResult(undefined);
    const r = await executeTool(tool.id, input, { actor: { type: "user", name: "Pawan" }, audit: recordEvent });
    setResult(r);
    setRunning(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel className="mb-0">Test with sample input</FieldLabel>
        <Button size="sm" onClick={run} disabled={running}>
          {running ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
          {running ? "Executing securely…" : "Run test"}
        </Button>
      </div>
      <JsonBlock value={input} />
      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            <ResultBadge result={result.result} /> {result.summary} · {formatDuration(result.durationMs)}
          </div>
          {result.data !== undefined && <JsonBlock value={result.data} className="max-h-64" />}
        </div>
      )}
    </div>
  );
}

export function ToolDrawer({ tool, onClose }: { tool: ToolDefinition | undefined; onClose: () => void }) {
  const connections = useOperator((s) => s.connections);
  const activity = useOperator((s) => s.activity);
  const sessionRuns = useOperator((s) => (tool ? s.activity.filter((e) => e.toolId === tool.id && !e.id.startsWith("evt_seed")).length : 0));
  const connection = tool ? connections.find((c) => c.id === tool.connection) : undefined;
  const executions = tool ? activity.filter((e) => e.toolId === tool.id).slice(0, 5) : [];
  const agents = tool ? agentsForTool(tool.id) : [];

  return (
    <Sheet open={!!tool} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        {tool && (
          <>
            <SheetHeader>
              <div className="mb-1.5 flex items-center gap-2">
                <TypeBadge type={tool.type} />
                <StatusBadge status={tool.status} />
              </div>
              <SheetTitle className="font-mono text-[14px]">{tool.name}</SheetTitle>
              <SheetDescription>{tool.description}</SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-6">
              <DetailList
                items={[
                  {
                    label: "Connection",
                    value: connection && (
                      <Link href={`/connections/${connection.id}`} className="flex items-center gap-2 hover:underline">
                        <ConnectionIcon kind={connection.kind} size="sm" /> {connection.name}
                      </Link>
                    ),
                  },
                  { label: "Permission", value: <PermissionBadge permission={tool.permission} /> },
                  { label: "Risk", value: <RiskBadge risk={tool.risk} /> },
                  { label: "Approval policy", value: <span className="text-ink-2">{tool.approval.description}</span> },
                  { label: "Executions", value: <span className="tabular">{formatNumber(tool.executions + sessionRuns)} this month</span> },
                ]}
              />

              <div>
                <FieldLabel>Input schema</FieldLabel>
                <JsonBlock value={tool.inputSchema} className="max-h-64" />
              </div>

              <div>
                <FieldLabel>Connected agents</FieldLabel>
                {agents.length ? (
                  <ul className="divide-y divide-line rounded-lg border border-line">
                    {agents.map((a) => (
                      <li key={a.id}>
                        <Link href={`/agents/${a.id}`} className="flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors hover:bg-surface-muted">
                          {a.name}
                          <AccessBadge access={a.access} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-line px-3.5 py-3 text-sm text-muted">Not assigned to any agent. Available to people with {tool.permission}.</p>
                )}
              </div>

              <div>
                <FieldLabel>Last executions</FieldLabel>
                {executions.length ? (
                  <ul className="divide-y divide-line rounded-lg border border-line">
                    {executions.map((e) => (
                      <li key={e.id}>
                        <Link href={`/activity?event=${e.id}`} className="flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors hover:bg-surface-muted">
                          <span className="tabular w-12 shrink-0 text-xs text-muted">{logTime(e.timestamp)}</span>
                          <span className="min-w-0 flex-1 truncate text-ink-2">{e.resource}</span>
                          <ResultBadge result={e.result} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-line px-3.5 py-3 text-sm text-muted">No executions recorded today.</p>
                )}
              </div>

              {tool.type === "read" && tool.status === "active" && <TestRunner key={tool.id} tool={tool} />}
            </SheetBody>
            {tool.type === "write" && (
              <SheetFooter>
                <span className="text-xs text-muted">Write tools cannot be run from here. They execute through agents or workflows, subject to their approval policy.</span>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
