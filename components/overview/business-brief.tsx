import { ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";
import { askHref } from "@/components/shell/links";

export function BusinessBrief({ items, questions }: { items: React.ReactNode[]; questions: string[] }) {
  return (
    <section className="rounded-xl border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted" strokeWidth={1.75} />
          <h2 className="text-sm font-medium text-ink">Today&apos;s brief</h2>
        </div>
        <span className="text-xs text-muted">8:30 AM · Management Brief</span>
      </header>
      <ul className="space-y-3 px-5 py-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-[21px] text-ink-2">
            <span className="mt-[9px] h-px w-2.5 shrink-0 bg-subtle" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-line px-5 py-3.5">
        <div className="mb-2 text-xs text-muted">Ask about this</div>
        <div className="flex flex-col items-start gap-1">
          {questions.map((q) => (
            <Link
              key={q}
              href={askHref(q)}
              className="group -mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink"
            >
              {q}
              <ArrowUpRight className="size-3.5 text-subtle transition-colors group-hover:text-ink" />
            </Link>
          ))}
        </div>
      </div>
      <footer className="rounded-b-xl border-t border-line bg-surface-muted px-5 py-2.5 text-2xs text-muted">
        Compiled from HubSpot CRM, Custom ERP and PostgreSQL · 6 tool calls · read-only
      </footer>
    </section>
  );
}
