import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; tone: "up" | "down" | "neutral" };
  meta?: React.ReactNode;
}

/** A single hairline container with vertical separators — not a row of floating cards. */
export function MetricGrid({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]",
        className,
      )}
      style={{ "--cols": metrics.length } as React.CSSProperties}
    >
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={cn(
            "flex flex-col gap-1.5 px-4 py-3.5 sm:px-5 sm:py-4",
            "border-line max-lg:[&:nth-child(2n)]:border-l max-lg:[&:nth-child(n+3)]:border-t",
            i > 0 && "lg:border-l",
          )}
        >
          <span className="text-xs text-muted">{m.label}</span>
          <span className="tabular text-[22px] leading-7 font-medium tracking-[-0.02em] text-ink">{m.value}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            {m.delta && (
              <span
                className={cn(
                  "tabular font-medium",
                  m.delta.tone === "up" && "text-green",
                  m.delta.tone === "down" && "text-red",
                  m.delta.tone === "neutral" && "text-ink-2",
                )}
              >
                {m.delta.value}
              </span>
            )}
            {m.meta}
          </span>
        </div>
      ))}
    </div>
  );
}
