"use client";

import { Mail, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DraftComposer } from "@/components/runtime/draft-composer";
import { MetricGrid } from "@/components/overview/metric-grid";
import { SectionHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { getCustomer, metrics, overdueInvoices, type Invoice } from "@/lib/mock/company";
import { useOperator } from "@/lib/store";
import { cn, formatINR, formatLakh } from "@/lib/utils";

function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "grid size-4 place-items-center rounded-[4px] border transition-colors",
        checked || indeterminate ? "border-ink bg-ink text-primary-fg" : "border-line-strong bg-surface hover:border-ink/40",
      )}
    >
      {checked && !indeterminate && (
        <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {indeterminate && <span className="h-[1.5px] w-2 rounded bg-current" />}
    </button>
  );
}

export function ReceivablesView() {
  const approvals = useOperator((s) => s.approvals);
  const [selected, setSelected] = useState<string[]>(() => overdueInvoices.filter((i) => i.daysOverdue > 45).map((i) => i.id));
  const [batch, setBatch] = useState<{ key: number; ids: string[] } | null>(null);

  const pendingFor = useMemo(() => {
    const map = new Map<string, string>();
    approvals.filter((a) => a.status === "pending" && a.kind === "payment_reminder").forEach((a) => a.covers?.forEach((c) => map.set(c, a.id)));
    return map;
  }, [approvals]);

  const sentFor = useMemo(() => {
    const set = new Set<string>();
    approvals.filter((a) => a.status === "approved" && a.kind === "payment_reminder").forEach((a) => a.covers?.forEach((c) => set.add(c)));
    return set;
  }, [approvals]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const all = selected.length === overdueInvoices.length;
  const selectedTotal = overdueInvoices.filter((i) => selected.includes(i.id)).reduce((s, i) => s + i.amount, 0);
  const over45 = overdueInvoices.filter((i) => i.daysOverdue > 45);

  return (
    <div className="space-y-8">
      <MetricGrid
        metrics={[
          { label: "Overdue", value: formatLakh(metrics.outstanding), meta: `${metrics.overdueInvoices} invoices · ${metrics.overdueInvoices} customers` },
          { label: "Over 45 days", value: formatLakh(over45.reduce((s, i) => s + i.amount, 0)), meta: `${over45.length} invoices` },
          { label: "Oldest", value: `${metrics.oldestOverdueDays} days`, meta: "ABC Industries · INV-318" },
          { label: "Reminded today", value: "3", meta: "INV-342, INV-349, INV-356" },
        ]}
      />

      <section>
        <SectionHeader
          title="Overdue invoices"
          meta="Custom ERP · synced just now"
          className="mb-3"
          actions={
            <div className="flex items-center gap-3">
              {selected.length > 0 && (
                <span className="hidden text-xs text-muted tabular sm:inline">
                  {selected.length} selected · {formatINR(selectedTotal)}
                </span>
              )}
              <Button
                variant="primary"
                disabled={!selected.length}
                onClick={() => setBatch({ key: Date.now(), ids: overdueInvoices.filter((i) => selected.includes(i.id)).map((i) => i.id) })}
              >
                <Mail className="size-3.5" /> Prepare reminders
              </Button>
            </div>
          }
        />

        {batch && (
          <div className="relative mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted">Finance Assistant · {batch.ids.length} invoices</span>
              <button onClick={() => setBatch(null)} className="rounded p-0.5 text-muted hover:bg-hover hover:text-ink" aria-label="Dismiss">
                <X className="size-3.5" />
              </button>
            </div>
            <DraftComposer key={batch.key} kind="payment_reminder" subjects={batch.ids} />
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-line">
          <DataTable<Invoice>
            rows={overdueInvoices}
            rowKey={(r) => r.id}
            onRowClick={(r) => toggle(r.id)}
            columns={[
              {
                key: "select",
                header: <Checkbox label="Select all" checked={all} indeterminate={!all && selected.length > 0} onChange={() => setSelected(all ? [] : overdueInvoices.map((i) => i.id))} />,
                cell: (r) => <Checkbox label={`Select ${r.id}`} checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />,
                className: "w-10",
                headerClassName: "w-10",
              },
              { key: "invoice", header: "Invoice", cell: (r) => <span className="font-mono text-xs text-ink-2">{r.id}</span> },
              { key: "customer", header: "Customer", cell: (r) => <span className="font-medium">{getCustomer(r.customerId)?.name}</span> },
              { key: "amount", header: "Amount", align: "right", cell: (r) => formatINR(r.amount) },
              { key: "due", header: "Due", cell: (r) => <span className="text-ink-2">{r.due}</span> },
              {
                key: "overdue",
                header: "Overdue",
                align: "right",
                cell: (r) => <span className={r.daysOverdue > 60 ? "text-red" : r.daysOverdue > 45 ? "text-amber" : "text-ink-2"}>{r.daysOverdue} days</span>,
              },
              {
                key: "status",
                header: "Reminder",
                cell: (r) =>
                  pendingFor.has(r.id) ? (
                    <Badge tone="amber">Awaiting approval · {pendingFor.get(r.id)}</Badge>
                  ) : sentFor.has(r.id) ? (
                    <Badge tone="green">Sent today</Badge>
                  ) : (
                    <span className="text-xs text-muted">{r.lastReminder ? `Last sent ${r.lastReminder}` : "None sent"}</span>
                  ),
              },
            ]}
            selectedKey={null}
          />
        </div>
      </section>
    </div>
  );
}
