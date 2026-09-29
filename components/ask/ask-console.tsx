"use client";

import { ArrowRight, ArrowUp, ChevronDown, CornerDownLeft, Download, ListChecks, Mail, ShieldCheck, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { DraftComposer } from "@/components/runtime/draft-composer";
import { appendTraceLine, ExecutionTrace } from "@/components/runtime/execution-trace";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { stalledDeals } from "@/lib/mock/company";
import { ask, runCalls, type AskRun } from "@/lib/runtime/execute";
import type { AskAction, AskResponse } from "@/lib/runtime/router";
import { useOperator } from "@/lib/store";
import { cn, formatDuration } from "@/lib/utils";

export const suggestedPrompts = [
  "Show customers with invoices overdue by more than 45 days.",
  "Which deals have had no activity in the last 10 days?",
  "Why is revenue lower this week?",
  "Find customers who spent more than ₹5L last year but have not ordered in six months.",
  "Show low-stock products.",
];

interface Entry {
  id: number;
  prompt: string;
  status: "running" | "done";
  lines: string[];
  run?: AskRun;
  startedAt: number;
  elapsed?: number;
}

/** Ask history survives navigation within the session. */
const useAskHistory = create<{ entries: Entry[]; set: (fn: (e: Entry[]) => Entry[]) => void }>()((set) => ({
  entries: [],
  set: (fn) => set((s) => ({ entries: fn(s.entries) })),
}));

let entrySeq = 0;

function exportCsv(response: AskResponse) {
  if (!response.table) return;
  const { columns, rows } = response.table;
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [columns.map((c) => esc(c.label)).join(","), ...rows.map((r) => columns.map((c) => esc(r[c.key] ?? "")).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${response.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const actionIcon: Partial<Record<AskAction["id"], typeof Mail>> = {
  draft_reminders: Mail,
  prepare_outreach: Users,
  create_tasks: ListChecks,
  export: Download,
  open_approvals: ShieldCheck,
};

function TaskRunner({ dealIds }: { dealIds: string[] }) {
  const hooks = useOperator((s) => s.hooks);
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const deals = stalledDeals.filter((d) => dealIds.includes(d.id));
    const log = (m: string) => setLines((l) => appendTraceLine(l, m));
    void runCalls(
      deals.map((d) => ({ toolId: "hubspot.create_task", input: { deal_id: d.id, owner: d.owner, title: `Re-engage: ${d.name}`, due: "Tomorrow" } })),
      "sales-assistant",
      hooks(log),
    ).then(() => {
      setLines((l) => [...l, `${deals.length} follow-up tasks created in HubSpot`]);
      setDone(true);
    });
  }, [dealIds, hooks]);

  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
      <ExecutionTrace lines={lines} running={!done} />
    </div>
  );
}

function ResultView({ entry }: { entry: Entry }) {
  const router = useRouter();
  const [active, setActive] = useState<AskAction["id"] | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const run = entry.run!;
  const r = run.response;

  const onAction = (a: AskAction) => {
    if (a.id === "export") return exportCsv(r);
    if (a.id === "open_finance") return router.push("/finance");
    if (a.id === "open_approvals") return router.push(r.intent === "low_stock" ? "/approvals?id=APR-1044" : "/approvals");
    setActive(a.id);
  };

  const connections = [...new Set(run.plan.calls.map((c) => c.toolId.split(".")[0]))];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setTraceOpen((v) => !v)}
        className="flex items-center gap-2 text-xs text-muted transition-colors hover:text-ink"
        aria-expanded={traceOpen}
      >
        <span className="flex -space-x-1">
          {connections.map((c) => (
            <ConnectionIcon key={c} kind={c as never} size="sm" className="ring-2 ring-surface" />
          ))}
        </span>
        {run.agentName} · {run.executions.length} tool {run.executions.length === 1 ? "call" : "calls"}
        {entry.elapsed ? ` · ${formatDuration(entry.elapsed)}` : ""}
        <ChevronDown className={cn("size-3 transition-transform", traceOpen && "rotate-180")} />
      </button>
      {traceOpen && (
        <div className="rounded-lg border border-line bg-surface-muted px-3.5 py-3">
          <ExecutionTrace lines={entry.lines} running={false} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs text-muted">{r.title}</div>
            {r.headline && <div className="tabular mt-1 text-[22px] leading-7 font-medium tracking-[-0.02em] text-ink">{r.headline.value}</div>}
          </div>
          {r.headline && <div className="text-xs text-muted sm:text-right">{r.headline.meta}</div>}
        </div>

        {r.paragraphs && r.paragraphs.length > 0 && (
          <div className={cn("space-y-2.5 px-5 py-4 text-sm leading-6 text-ink-2", r.table && "border-b border-line")}>
            {r.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {r.table && (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line">
                  {r.table.columns.map((c) => (
                    <th key={c.key} className={cn("h-9 px-3 text-xs font-normal text-muted first:pl-5 last:pr-5", c.align === "right" ? "text-right" : "text-left")}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {r.table!.columns.map((c, ci) => (
                      <td
                        key={c.key}
                        className={cn(
                          "h-11 px-3 first:pl-5 last:pr-5",
                          c.align === "right" ? "tabular text-right" : "text-left",
                          c.mono && "font-mono text-xs",
                          ci === 0 ? "font-medium text-ink" : "text-ink-2",
                        )}
                      >
                        {row[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {r.actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-muted px-5 py-3">
            <span className="mr-1 text-xs text-muted">Suggested actions</span>
            {r.actions.map((a) => {
              const Icon = actionIcon[a.id] ?? ArrowRight;
              return (
                <Button key={a.id} size="sm" variant={a.primary && !active ? "primary" : "secondary"} disabled={a.primary && !!active} onClick={() => onAction(a)}>
                  <Icon /> {a.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {active === "draft_reminders" && <DraftComposer kind="payment_reminder" subjects={r.subjects ?? []} />}
      {active === "prepare_outreach" && <DraftComposer kind="outreach" subjects={r.subjects ?? []} />}
      {active === "create_tasks" && <TaskRunner dealIds={r.subjects ?? []} />}
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-3"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#dedcd5] text-[10px] font-semibold text-ink-2">P</span>
        <p className="pt-0.5 text-[15px] leading-6 text-ink">{entry.prompt}</p>
      </div>
      <div className="pl-9">
        {entry.status === "running" ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
              <ExecutionTrace lines={entry.lines} running />
            </div>
            <div className="space-y-2 rounded-xl border border-line px-5 py-4">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-6 w-44" />
              <div className="skeleton mt-4 h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
            </div>
          </div>
        ) : (
          <ResultView entry={entry} />
        )}
      </div>
    </motion.article>
  );
}

export function AskConsole() {
  const params = useSearchParams();
  const router = useRouter();
  const hooks = useOperator((s) => s.hooks);
  const connections = useOperator((s) => s.connections);
  const entries = useAskHistory((s) => s.entries);
  const setEntries = useAskHistory((s) => s.set);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handled = useRef<string | null>(null);

  const busy = entries.some((e) => e.status === "running");

  const submit = async (prompt: string) => {
    const text = prompt.trim();
    if (!text || busy) return;
    setValue("");
    const id = ++entrySeq;
    const startedAt = performance.now();
    setEntries((list) => [{ id, prompt: text, status: "running", lines: [], startedAt }, ...list]);
    const update = (fn: (e: Entry) => Entry) => setEntries((list) => list.map((e) => (e.id === id ? fn(e) : e)));
    const run = await ask(
      text,
      hooks((line) => update((e) => ({ ...e, lines: appendTraceLine(e.lines, line) }))),
    );
    update((e) => ({ ...e, status: "done", run, elapsed: performance.now() - startedAt }));
  };

  // Deep links (/ask?q=…) run once, then the URL is cleaned up.
  const q = params.get("q");
  useEffect(() => {
    if (!q || handled.current === q) return;
    handled.current = q;
    router.replace("/ask", { scroll: false });
    void submit(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-medium tracking-[-0.015em] text-ink">Ask your business</h1>
        <p className="text-sm text-muted">Query connected systems, investigate activity, or prepare actions.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(value);
        }}
        className="group rounded-xl border border-line-strong bg-surface shadow-sm transition-[border-color,box-shadow] focus-within:border-ink/30 focus-within:shadow-[0_0_0_3px_var(--ring)]"
      >
        <textarea
          ref={inputRef}
          value={value}
          rows={2}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit(value);
            }
          }}
          placeholder="Ask about customers, revenue, inventory, sales or operations..."
          className="block w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-6 text-ink outline-none placeholder:text-subtle"
          aria-label="Ask Operator"
        />
        <div className="flex items-center justify-between px-3 pt-1 pb-2.5">
          <div className="flex items-center gap-1.5 pl-1 text-xs text-muted">
            <span className="flex -space-x-1">
              {connections.slice(0, 5).map((c) => (
                <ConnectionIcon key={c.id} kind={c.kind} size="sm" className="ring-2 ring-surface" />
              ))}
            </span>
            <span className="hidden sm:inline">{connections.length} systems · runs with your permissions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 text-2xs text-subtle sm:flex">
              <Kbd>
                <CornerDownLeft className="size-2.5" />
              </Kbd>
              to run
            </span>
            <Button type="submit" variant="primary" size="icon-sm" disabled={!value.trim() || busy} aria-label="Run">
              <ArrowUp />
            </Button>
          </div>
        </div>
      </form>

      <AnimatePresence initial={false}>
        {entries.length === 0 && (
          <motion.div exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="mt-6">
              <div className="mb-2 text-xs text-muted">Try</div>
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {suggestedPrompts.map((p) => (
                  <li key={p}>
                    <button
                      onClick={() => void submit(p)}
                      className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      {p}
                      <ArrowRight className="size-3.5 shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                disabled={busy}
                onClick={() => void submit(p)}
                className="h-7 max-w-full truncate rounded-md border border-line bg-surface px-2.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:bg-surface-muted hover:text-ink disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-10">
            {entries.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
