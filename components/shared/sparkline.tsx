import { cn } from "@/lib/utils";

/** Minimal bar sparkline — enough to show cadence without a chart library. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex h-8 items-end gap-[2px]", className)} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn("flex-1 rounded-[1px]", i === values.length - 1 ? "bg-ink-2" : "bg-line-strong")}
          style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
