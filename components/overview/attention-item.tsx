import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Severity = "high" | "medium" | "watch";

const severity: Record<Severity, { label: string; dot: string; text: string }> = {
  high: { label: "High", dot: "bg-red/80", text: "text-red" },
  medium: { label: "Medium", dot: "bg-amber", text: "text-amber" },
  watch: { label: "Watch", dot: "bg-amber", text: "text-amber" },
};

export function AttentionItem({
  category,
  level,
  title,
  detail,
  cta,
  href,
  visual,
}: {
  category: string;
  level: Severity;
  title: React.ReactNode;
  detail: React.ReactNode;
  cta: string;
  href: string;
  visual?: React.ReactNode;
}) {
  const s = severity[level];
  return (
    <div className="group grid gap-4 px-4 py-4 transition-colors duration-150 hover:bg-surface-muted sm:grid-cols-[1fr_auto] sm:items-center sm:px-5">
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-ink-2">{category}</span>
          <span className="text-line-strong">·</span>
          <span className={cn("inline-flex items-center gap-1.5", s.text)}>
            <span className={cn("size-1.5 rounded-full", s.dot)} />
            {s.label}
          </span>
        </div>
        <div className="text-[15px] leading-6 text-ink">{title}</div>
        <div className="text-sm text-muted">{detail}</div>
        {visual && <div className="pt-1.5">{visual}</div>}
      </div>
      <Button asChild size="md" className="justify-self-start sm:justify-self-end">
        <Link href={href}>
          {cta}
          <ArrowRight className="size-3.5 text-muted transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}
