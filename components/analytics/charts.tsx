"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/utils";

const INK = "#3a3a37";
const GRID = "#eeeeeb";
const AXIS = "#9c9b95";

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: readonly { value?: unknown }[];
  label?: string | number;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-2.5 py-1.5 shadow-pop">
      <div className="text-2xs text-muted">{label}</div>
      <div className="tabular text-sm font-medium text-ink">
        {formatNumber(Number(payload[0].value))} <span className="font-normal text-muted">{unit}</span>
      </div>
    </div>
  );
}

/** Daily column chart with a highlighted latest value. */
export function DailyColumns({
  data,
  dataKey,
  labelKey,
  unit,
  height = 220,
}: {
  data: object[];
  dataKey: string;
  labelKey: string;
  unit: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tick={{ fill: AXIS, fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} width={44} />
          <Tooltip cursor={{ fill: "#1b1b1908" }} content={(p) => <ChartTooltip active={p.active} payload={p.payload} label={p.label} unit={unit} />} />
          <Bar dataKey={dataKey} fill={INK} radius={[3, 3, 0, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
