import {
  customers,
  daysToMinimum,
  getCustomer,
  lowStock,
  metrics,
  overdueInvoices,
  reactivationCandidates,
  stalledDeals,
  tataQuote,
} from "@/lib/mock/company";
import { formatINR, formatLakh } from "@/lib/utils";
import type { ToolHandler } from "./types";

/**
 * Mock connectors. Each handler stands in for a call to a real system
 * (HubSpot, the ERP API, a read-only Postgres role, Gmail, Drive) and returns
 * shaped records plus a one-line summary for execution metadata.
 */

const str = (v: unknown) => (typeof v === "string" ? v : "");
const numOr = (v: unknown, fallback: number) => (typeof v === "number" ? v : fallback);

export const handlers: Record<string, ToolHandler> = {
  // ── ERP ────────────────────────────────────────────────────────────────
  "erp.get_outstanding_invoices": (input) => {
    const min = numOr(input.min_days_overdue, 30);
    const rows = overdueInvoices
      .filter((i) => i.daysOverdue > min)
      .map((i) => ({ ...i, customer: getCustomer(i.customerId)!.name }));
    const total = rows.reduce((s, r) => s + r.amount, 0);
    return { data: { invoices: rows, total }, summary: `Retrieved ${rows.length} invoices · ${formatINR(total)}`, resource: `${rows.length} invoices` };
  },
  "erp.get_invoice": (input) => {
    const inv = overdueInvoices.find((i) => i.id === str(input.invoice_id)) ?? overdueInvoices[0];
    return { data: inv, summary: `Retrieved ${inv.id}`, resource: inv.id };
  },
  "erp.get_customer": (input) => {
    const ids = Array.isArray(input.customer_ids) ? (input.customer_ids as string[]) : [str(input.customer_id)];
    const rows = ids.map((id) => getCustomer(id)).filter(Boolean);
    return {
      data: rows,
      summary: rows.length === 1 ? `Retrieved billing profile for ${rows[0]!.name}` : `Retrieved ${rows.length} billing contacts`,
      resource: rows.length === 1 ? rows[0]!.name : `${rows.length} customers`,
    };
  },
  "erp.check_inventory": (input) => {
    const sku = str(input.sku);
    const rows = (sku ? lowStock.filter((i) => i.sku === sku) : lowStock).map((i) => ({
      ...i,
      daysToMinimum: daysToMinimum(i),
      belowMinimum: i.onHand < i.minimum,
    }));
    return { data: rows, summary: sku ? `Checked stock for ${sku}` : `Checked ${metrics.inventorySkus} SKUs · ${rows.length} flagged`, resource: sku || `${rows.length} SKUs` };
  },
  "erp.get_stock_forecast": (input) => {
    const item = lowStock.find((i) => i.sku === str(input.sku)) ?? lowStock[0];
    return { data: { ...item, daysToMinimum: daysToMinimum(item) }, summary: `${item.name} reaches minimum in ${daysToMinimum(item)} days`, resource: item.sku };
  },
  "erp.get_pricing": (input) => ({ data: { customer_id: input.customer_id, price_list: "Contract 2026", lines: tataQuote.lines }, summary: "Retrieved contract pricing", resource: getCustomer(str(input.customer_id))?.name ?? "Price list" }),
  "erp.get_orders": (input) => ({ data: { customer_id: input.customer_id, orders: 9 }, summary: "Retrieved order history", resource: getCustomer(str(input.customer_id))?.name ?? "Orders" }),
  "erp.get_revenue_summary": () => ({
    data: {
      month_to_date: metrics.revenueThisMonth,
      vs_last_month_pct: metrics.revenueVsLastMonth,
      this_week: 7_90_000,
      trailing_weekly_avg: 9_60_000,
    },
    summary: `Revenue ${formatLakh(metrics.revenueThisMonth)} month to date`,
    resource: "September 2026",
  }),
  "erp.create_quote": (input) => ({ data: { quote_id: input.quote_id ?? "QT-2043", status: "issued", total: tataQuote.total }, summary: `Issued ${str(input.quote_id) || "quotation"} to customer`, resource: getCustomer(str(input.customer_id))?.name ?? "Quotation" }),
  "erp.create_order": (input) => ({ data: { order_id: "SO-5528", quote_id: input.quote_id }, summary: "Created sales order SO-5528", resource: str(input.quote_id) }),
  "erp.create_purchase_requisition": (input) => ({ data: { requisition_id: "PR-0231", status: "released_to_supplier", sku: input.sku, qty: input.qty }, summary: `Released PR-0231 to ${str(input.supplier) || "supplier"}`, resource: str(input.sku) }),
  "erp.create_credit_note": (input) => ({ data: { credit_note_id: "CN-0087", invoice_id: input.invoice_id, amount: input.amount }, summary: `Issued CN-0087 for ${formatINR(numOr(input.amount, 0))}`, resource: str(input.invoice_id) }),
  "erp.update_invoice_status": (input) => ({ data: { invoice_id: input.invoice_id, status: input.status }, summary: `Marked ${str(input.invoice_id)} as ${str(input.status)}`, resource: str(input.invoice_id) }),
  "erp.issue_refund": (input) => ({ data: { refunded: false }, summary: "Refund not processed", resource: str(input.invoice_id) }),

  // ── HubSpot ────────────────────────────────────────────────────────────
  "hubspot.search_customer": (input) => {
    if (typeof input.min_spend_12m === "number") {
      const rows = reactivationCandidates.map((c) => ({ ...c, customer: getCustomer(c.customerId)! }));
      return { data: rows, summary: `Matched ${rows.length} of ${metrics.customers} customers`, resource: `${rows.length} customers` };
    }
    const q = str(input.query).toLowerCase();
    const rows = customers.filter((c) => c.name.toLowerCase().includes(q));
    return { data: rows, summary: `Found ${rows.length} ${rows.length === 1 ? "company" : "companies"}`, resource: rows[0]?.name ?? str(input.query) };
  },
  "hubspot.get_deals": (input) => {
    const days = numOr(input.inactive_days, 0);
    const rows = stalledDeals.filter((d) => d.daysInactive >= days).map((d) => ({ ...d, customer: getCustomer(d.customerId)!.name }));
    return days
      ? { data: rows, summary: `Found ${rows.length} deals without activity for ${days}+ days`, resource: `${rows.length} deals` }
      : { data: { open: metrics.openOpportunities, value: metrics.openPipeline }, summary: `Retrieved ${metrics.openOpportunities} open deals`, resource: `${metrics.openOpportunities} deals` };
  },
  "hubspot.get_company_timeline": (input) => ({ data: { company: input.company, events: 14 }, summary: "Retrieved 14 timeline events", resource: str(input.company) }),
  "hubspot.get_contact": (input) => ({ data: { company: input.company }, summary: "Retrieved primary contact", resource: str(input.company) }),
  "hubspot.update_deal": (input) => ({ data: { deal_id: input.deal_id, updated: true }, summary: `Updated ${str(input.deal_id)}`, resource: str(input.deal_id) }),
  "hubspot.create_task": (input) => ({ data: { task_id: `T-${str(input.deal_id).slice(2)}`, owner: input.owner }, summary: `Created task for ${str(input.owner)}`, resource: str(input.deal_id) }),
  "hubspot.log_activity": (input) => ({ data: { logged: true }, summary: `Logged ${str(input.type)} on timeline`, resource: str(input.company) }),
  "hubspot.delete_customer": () => ({ data: null, summary: "Not executed", resource: "Company" }),

  // ── PostgreSQL (read-only) ─────────────────────────────────────────────
  "postgres.get_receivables_aging": () => {
    const buckets = [
      { bucket: "31–45 days", amount: overdueInvoices.filter((i) => i.daysOverdue <= 45).reduce((s, i) => s + i.amount, 0) },
      { bucket: "46–60 days", amount: overdueInvoices.filter((i) => i.daysOverdue > 45 && i.daysOverdue <= 60).reduce((s, i) => s + i.amount, 0) },
      { bucket: "60+ days", amount: overdueInvoices.filter((i) => i.daysOverdue > 60).reduce((s, i) => s + i.amount, 0) },
    ];
    return { data: buckets, summary: "Computed receivables ageing", resource: "receivables_aging" };
  },
  "postgres.get_kpi_snapshot": () => ({ data: metrics, summary: "Retrieved KPI snapshot", resource: "kpi_snapshot" }),
  "postgres.get_pipeline_snapshot": () => ({ data: { open: metrics.openPipeline, deals: metrics.openOpportunities }, summary: `Pipeline ${formatLakh(metrics.openPipeline)} across ${metrics.openOpportunities} deals`, resource: "pipeline_snapshot" }),
  "postgres.get_sales_summary": () => ({ data: { weeks: 6 }, summary: "Retrieved weekly sales aggregates", resource: "sales_daily" }),
  "postgres.get_customer_ltv": (input) => ({ data: getCustomer(str(input.customer_id)), summary: "Retrieved lifetime value", resource: getCustomer(str(input.customer_id))?.name ?? "customer_ltv" }),
  "postgres.get_churn_signals": () => ({ data: reactivationCandidates, summary: `${reactivationCandidates.length} customers below usual cadence`, resource: "customer_ltv" }),
  "postgres.get_inventory_levels": () => ({ data: lowStock, summary: "Retrieved 90-day stock history", resource: "inventory_levels" }),

  // ── Gmail ──────────────────────────────────────────────────────────────
  "gmail.draft_email": (input) => ({ data: { draft_id: `r-${Math.abs(hash(str(input.to))).toString(36)}` }, summary: `Drafted email to ${str(input.company) || str(input.to)}`, resource: str(input.company) || str(input.to) }),
  "gmail.send_email": (input) => ({ data: { message_id: `<${Math.abs(hash(str(input.to) + str(input.subject))).toString(36)}@mail.acmeindustrial.in>`, mailbox: input.mailbox ?? "sales@" }, summary: `Sent to ${str(input.company) || str(input.to)}`, resource: str(input.company) || str(input.to) }),

  // ── Google Drive ───────────────────────────────────────────────────────
  "drive.find_document": (input) => ({ data: { files: [`${str(input.query)}.pdf`] }, summary: "Found 1 matching document", resource: str(input.query) }),
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Fallback for registered tools without a bespoke mock. */
export const genericHandler: ToolHandler = (input) => ({
  data: { ok: true, input },
  summary: "Completed",
  resource: Object.values(input).find((v) => typeof v === "string") as string | undefined ?? "—",
});
