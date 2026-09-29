import { formatNumber } from "@/lib/utils";

/** Ranked horizontal bars — values labelled at the tip, no legend (single series). */
export function BarList({ items }: { items: { key: string; label: React.ReactNode; value: number; hint?: string }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.key} title={i.hint} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink-2">{i.label}</span>
            <span className="tabular shrink-0 text-ink">{formatNumber(i.value)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-sunken">
            <div className="h-full rounded-full bg-ink-2 transition-[width] duration-500 group-hover:bg-ink" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
          {i.hint && <div className="mt-1 text-2xs text-muted">{i.hint}</div>}
        </li>
      ))}
    </ul>
  );
}
