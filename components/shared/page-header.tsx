import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow && <div className="text-xs text-muted">{eyebrow}</div>}
        <h1 className="text-xl font-medium tracking-[-0.015em] text-ink">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  meta,
  actions,
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-7 items-center justify-between gap-3", className)}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-medium text-ink">{title}</h2>
        {meta && <span className="text-xs text-muted">{meta}</span>}
      </div>
      {actions}
    </div>
  );
}
