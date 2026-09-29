import { DEMO_BASE } from "@/lib/utils";
import { agents } from "./agents";
import { metrics } from "./company";
import { toolCategory, toolDefinitions } from "./tools";

export const rates = {
  success: 97.8,
  approval: 8.4,
  blocked: 0.6,
};

export interface DailyPoint {
  date: string;
  label: string;
  executions: number;
}

/**
 * Daily executions for the last 30 days. September (1st to today) sums to the
 * month's total so the chart reconciles with the headline figure.
 */
function buildDaily(): DailyPoint[] {
  const day = 86_400_000;
  const points: { d: Date; raw: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(DEMO_BASE - i * day);
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    const trend = 1 + (29 - i) * 0.012;
    const wobble = 1 + Math.sin(i * 1.7) * 0.08;
    points.push({ d, raw: (weekend ? 170 : 520) * trend * wobble });
  }

  const today = points[points.length - 1];
  today.raw = 236;
  const september = points.filter((p) => p.d.getUTCMonth() === 8 && p !== today);
  const target = metrics.toolExecutions - today.raw;
  const scale = target / september.reduce((s, p) => s + p.raw, 0);
  september.forEach((p) => (p.raw = Math.round(p.raw * scale)));
  const drift = target - september.reduce((s, p) => s + p.raw, 0);
  september[september.length - 1].raw += drift;

  const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  return points.map((p) => ({
    date: p.d.toISOString().slice(0, 10),
    label: fmt.format(p.d),
    executions: Math.round(p.raw),
  }));
}

export const dailyExecutions = buildDaily();

export const usageByCategory = Object.entries(
  toolDefinitions.reduce<Record<string, { read: number; write: number }>>((acc, t) => {
    const cat = toolCategory[t.connection];
    acc[cat] ??= { read: 0, write: 0 };
    acc[cat][t.type] += t.executions;
    return acc;
  }, {}),
)
  .map(([category, v]) => ({ category, ...v, total: v.read + v.write }))
  .sort((a, b) => b.total - a.total);

export const agentUsage = agents
  .map((a) => ({ id: a.id, name: a.name, executions: a.executions }))
  .sort((a, b) => b.executions - a.executions);

export const topTools = [...toolDefinitions]
  .sort((a, b) => b.executions - a.executions)
  .slice(0, 6)
  .map((t) => ({ id: t.id, name: t.name, connection: t.connection, executions: t.executions }));
