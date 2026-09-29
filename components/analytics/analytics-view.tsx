"use client";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { BarList } from "@/components/shared/bar-list";
import { MetricGrid } from "@/components/overview/metric-grid";
import { agentUsage, dailyExecutions, rates, topTools, usageByCategory } from "@/lib/mock/analytics";
import { metrics } from "@/lib/mock/company";
import { getConnection } from "@/lib/mock/connections";
import { useOperator, useToolExecutions } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { DailyColumns } from "./charts";

function Panel({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line px-5 pt-4 pb-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">{title}</h2>
        {meta && <span className="text-xs text-muted">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export function AnalyticsView() {
  const executions = useToolExecutions();
  const activity = useOperator((s) => s.activity);
  const session = activity.filter((e) => e.toolId && !e.id.startsWith("evt_seed"));
  const sessionCount = (id: string) => session.filter((e) => e.toolId === id).length;
  const daily = dailyExecutions.map((d, i) => (i === dailyExecutions.length - 1 ? { ...d, executions: d.executions + session.length } : d));

  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          { label: "Tool executions", value: <AnimatedNumber value={executions} />, meta: "This month" },
          { label: "Estimated hours saved", value: formatNumber(metrics.hoursSaved), meta: "≈ 2.4 FTE weeks" },
          { label: "Successful executions", value: `${rates.success}%`, meta: "Across all connections" },
          { label: "Required approval", value: `${rates.approval}%`, meta: "Held for a person" },
          { label: "Blocked by policy", value: `${rates.blocked}%`, meta: "Denied before execution" },
        ]}
      />

      <Panel title="Executions over the last 30 days" meta="Today includes this session">
        <DailyColumns data={daily} dataKey="executions" labelKey="label" unit="executions" height={240} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Tool usage by category" meta="This month">
          <BarList
            items={usageByCategory.map((c) => ({
              key: c.category,
              label: c.category,
              value: c.total,
              hint: `${formatNumber(c.read)} read · ${formatNumber(c.write)} write`,
            }))}
          />
        </Panel>
        <Panel title="Agent usage" meta="Executions this month">
          <BarList items={agentUsage.map((a) => ({ key: a.id, label: a.name, value: a.executions }))} />
        </Panel>
        <Panel title="Most-used tools" meta="This month">
          <BarList
            items={topTools.map((t) => ({
              key: t.id,
              label: (
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink">{t.name}</span>
                  <span className="text-xs text-muted">{getConnection(t.connection)?.shortName}</span>
                </span>
              ),
              value: t.executions + sessionCount(t.id),
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
