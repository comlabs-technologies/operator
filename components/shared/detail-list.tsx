import { cn } from "@/lib/utils";

/** Two-column label/value list used in drawers and detail panels. */
export function DetailList({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line rounded-lg border border-line", className)}>
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[140px_1fr] items-center gap-3 px-3.5 py-2.5">
          <dt className="text-xs text-muted">{item.label}</dt>
          <dd className="min-w-0 text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-2 text-xs font-medium text-muted", className)}>{children}</div>;
}
