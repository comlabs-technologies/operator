import { getCustomer, customers, metrics, stalledDeals, type Invoice } from "@/lib/mock/company";
import type { ToolDefinition, ToolExecution } from "@/lib/mcp/types";
import { formatINR, formatLakh } from "@/lib/utils";

/**
 * Model routing.
 *
 * Operator never depends on a specific model vendor. A ModelProvider turns a
 * request into a tool plan (selectTools) and turns tool results into a
 * structured response (generate). Swapping OpenAI, Anthropic, Gemini or a
 * self-hosted model means adding a provider — nothing in the UI, gateway or
 * permission layer changes.
 *
 * The demo ships with MockProvider, a deterministic router over the
 * workspace's mock data.
 */

export type Intent =
  | "overdue_receivables"
  | "receivables_trend"
  | "stalled_deals"
  | "revenue_week"
  | "reactivation"
  | "low_stock"
  | "follow_ups"
  | "customer_lookup"
  | "unknown";

export interface PlannedCall {
  toolId: string;
  /** Static input, or derived from the results of earlier calls in the plan. */
  input: Record<string, unknown> | ((previous: ToolExecution[]) => Record<string, unknown>);
}

export interface ToolPlan {
  intent: Intent;
  agentId: string;
  calls: PlannedCall[];
}

export type AskActionId =
  | "draft_reminders"
  | "prepare_outreach"
  | "create_tasks"
  | "export"
  | "open_finance"
  | "open_approvals";

export interface AskAction {
  id: AskActionId;
  label: string;
  primary?: boolean;
}

export interface ResponseColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  mono?: boolean;
}

export interface AskResponse {
  intent: Intent;
  title: string;
  headline?: { value: string; meta: string };
  paragraphs?: string[];
  table?: { columns: ResponseColumn[]; rows: Record<string, string>[] };
  actions: AskAction[];
  /** Ids the follow-up actions operate on, e.g. invoice or customer ids. */
  subjects?: string[];
}

export interface ModelProvider {
  id: string;
  name: string;
  selectTools(prompt: string, tools: ToolDefinition[]): Promise<ToolPlan>;
  generate(plan: ToolPlan, results: ToolExecution[]): Promise<AskResponse>;
}

/** Providers the runtime has adapters for. Credentials are configured per workspace. */
export const providerCatalog = [
  { id: "mock", name: "Demo router", detail: "Deterministic routing over workspace data", status: "active" as const },
  { id: "anthropic", name: "Anthropic", detail: "Claude models via API", status: "available" as const },
  { id: "openai", name: "OpenAI", detail: "GPT models via API or Azure", status: "available" as const },
  { id: "gemini", name: "Google Gemini", detail: "Gemini models via Vertex AI", status: "available" as const },
  { id: "self-hosted", name: "Self-hosted", detail: "Any OpenAI-compatible endpoint (vLLM, Ollama)", status: "available" as const },
];

// ── Mock provider ─────────────────────────────────────────────────────────

function classify(prompt: string): Intent {
  const p = prompt.toLowerCase();
  if (/(spent|haven'?t|have not|not (ordered|purchased)|reactivat|lapsed|dormant)/.test(p)) return "reactivation";
  if (/overdue|unpaid|outstanding invoice/.test(p)) return "overdue_receivables";
  if (/receivable/.test(p)) return "receivables_trend";
  if (/deal|pipeline|no activity|opportunit/.test(p)) return "stalled_deals";
  if (/revenue|sales (are |is )?(lower|down)/.test(p)) return "revenue_week";
  if (/stock|inventory|model-x|sku/.test(p)) return "low_stock";
  if (/follow.?up|today|attention|priorit/.test(p)) return "follow_ups";
  if (customers.some((c) => p.includes(c.name.toLowerCase().split(" ")[0]))) return "customer_lookup";
  return "unknown";
}

function matchCustomer(prompt: string) {
  const p = prompt.toLowerCase();
  return customers.find((c) => p.includes(c.name.toLowerCase())) ?? customers.find((c) => p.includes(c.name.toLowerCase().split(" ")[0]));
}

type InvoiceRow = Invoice & { customer: string };

export class MockProvider implements ModelProvider {
  id = "mock";
  name = "Demo router";

  async selectTools(prompt: string): Promise<ToolPlan> {
    const intent = classify(prompt);
    switch (intent) {
      case "overdue_receivables": {
        const days = Number(/(\d+)\s*days?/.exec(prompt)?.[1] ?? 30);
        return {
          intent,
          agentId: "finance-assistant",
          calls: [
            { toolId: "erp.get_outstanding_invoices", input: { min_days_overdue: days } },
            {
              toolId: "erp.get_customer",
              input: ([invoices]) => ({
                customer_ids: (invoices.data as { invoices: InvoiceRow[] }).invoices.map((i) => i.customerId),
              }),
            },
          ],
        };
      }
      case "receivables_trend":
        return { intent, agentId: "finance-assistant", calls: [{ toolId: "postgres.get_receivables_aging", input: { as_of: "2026-09-29" } }, { toolId: "erp.get_outstanding_invoices", input: { min_days_overdue: 30 } }] };
      case "stalled_deals":
        return { intent, agentId: "sales-assistant", calls: [{ toolId: "hubspot.get_deals", input: { inactive_days: 10 } }] };
      case "revenue_week":
        return { intent, agentId: "management-brief", calls: [{ toolId: "erp.get_revenue_summary", input: { period: "week" } }, { toolId: "postgres.get_pipeline_snapshot", input: { as_of: "2026-09-29" } }] };
      case "reactivation":
        return { intent, agentId: "sales-assistant", calls: [{ toolId: "hubspot.search_customer", input: { min_spend_12m: 5_00_000, inactive_months: 6 } }] };
      case "low_stock":
        return { intent, agentId: "operations-assistant", calls: [{ toolId: "erp.check_inventory", input: { below_minimum: true } }, { toolId: "erp.get_stock_forecast", input: { sku: "MX-GB-220", horizon_days: 14 } }] };
      case "follow_ups":
        return { intent, agentId: "management-brief", calls: [{ toolId: "postgres.get_kpi_snapshot", input: { as_of: "2026-09-29" } }, { toolId: "hubspot.get_deals", input: { inactive_days: 10 } }, { toolId: "postgres.get_receivables_aging", input: { as_of: "2026-09-29" } }] };
      case "customer_lookup": {
        const c = matchCustomer(prompt);
        return { intent, agentId: "sales-assistant", calls: [{ toolId: "hubspot.search_customer", input: { query: c?.name ?? prompt } }] };
      }
      default:
        return { intent: "unknown", agentId: "sales-assistant", calls: [] };
    }
  }

  async generate(plan: ToolPlan, results: ToolExecution[]): Promise<AskResponse> {
    const ok = results.every((r) => r.result === "success");
    if (!ok) {
      const blocked = results.find((r) => r.result !== "success");
      return { intent: plan.intent, title: "Request not completed", paragraphs: [blocked?.reason ?? "A connected system did not respond."], actions: [] };
    }
    const first = results[0]?.data;

    switch (plan.intent) {
      case "overdue_receivables": {
        const { invoices, total } = first as { invoices: InvoiceRow[]; total: number };
        const minDays = Math.min(...invoices.map((i) => i.daysOverdue));
        return {
          intent: plan.intent,
          title: "Outstanding receivables",
          headline: { value: formatINR(total), meta: `${invoices.length} customers · oldest ${Math.max(...invoices.map((i) => i.daysOverdue))} days` },
          table: {
            columns: [
              { key: "customer", label: "Customer" },
              { key: "invoice", label: "Invoice", mono: true },
              { key: "amount", label: "Amount", align: "right" },
              { key: "overdue", label: "Overdue", align: "right" },
            ],
            rows: invoices.map((i) => ({ customer: i.customer, invoice: i.id, amount: formatINR(i.amount), overdue: `${i.daysOverdue} days` })),
          },
          paragraphs: minDays >= 45 ? [`These ${invoices.length} invoices account for ${Math.round((total / metrics.outstanding) * 100)}% of the ${formatLakh(metrics.outstanding)} currently overdue.`] : undefined,
          actions: [
            { id: "draft_reminders", label: "Draft payment reminders", primary: true },
            { id: "export", label: "Export results" },
            { id: "open_finance", label: "Open finance view" },
          ],
          subjects: invoices.map((i) => i.id),
        };
      }
      case "receivables_trend": {
        const buckets = first as { bucket: string; amount: number }[];
        return {
          intent: plan.intent,
          title: "Receivables ageing",
          headline: { value: formatLakh(metrics.outstanding), meta: "Overdue · up from ₹5.9L on 31 Aug" },
          paragraphs: [
            "Overdue receivables have risen 42% since the end of August. Most of the increase comes from one invoice: ABC Industries INV-318 (₹4,82,000) moved past 60 days this month and now makes up 57% of the overdue balance.",
            "Delta Engineering (51 days) and Metro Components (47 days) have also crossed 45 days. The three invoices between 31 and 38 days were reminded this morning.",
          ],
          table: {
            columns: [
              { key: "bucket", label: "Age" },
              { key: "amount", label: "Amount", align: "right" },
              { key: "share", label: "Share", align: "right" },
            ],
            rows: buckets.map((b) => ({ bucket: b.bucket, amount: formatINR(b.amount), share: `${Math.round((b.amount / metrics.outstanding) * 100)}%` })),
          },
          actions: [
            { id: "open_finance", label: "Open finance view", primary: true },
            { id: "export", label: "Export results" },
          ],
        };
      }
      case "stalled_deals": {
        const deals = first as (typeof stalledDeals[number] & { customer: string })[];
        const value = deals.reduce((s, d) => s + d.value, 0);
        return {
          intent: plan.intent,
          title: "Deals without recent activity",
          headline: { value: formatLakh(value), meta: `${deals.length} of ${metrics.openOpportunities} open deals · no activity for 10+ days` },
          table: {
            columns: [
              { key: "customer", label: "Customer" },
              { key: "deal", label: "Deal" },
              { key: "owner", label: "Owner" },
              { key: "value", label: "Value", align: "right" },
              { key: "inactive", label: "Inactive", align: "right" },
            ],
            rows: deals.map((d) => ({ customer: d.customer, deal: `${d.name} · ${d.stage}`, owner: d.owner, value: formatINR(d.value), inactive: `${d.daysInactive} days` })),
          },
          actions: [
            { id: "create_tasks", label: "Create follow-up tasks", primary: true },
            { id: "export", label: "Export results" },
          ],
          subjects: deals.map((d) => d.id),
        };
      }
      case "revenue_week":
        return {
          intent: plan.intent,
          title: "Revenue this week",
          headline: { value: "₹7.9L", meta: "vs ₹9.6L trailing 4-week average · −17.7%" },
          paragraphs: [
            `The month overall is still ${metrics.revenueVsLastMonth}% ahead of August (${formatLakh(metrics.revenueThisMonth)} to date). This week's shortfall of ₹1.7L comes from three items:`,
          ],
          table: {
            columns: [
              { key: "driver", label: "Driver" },
              { key: "impact", label: "Impact", align: "right" },
            ],
            rows: [
              { driver: "Nova Autoparts dispatch deferred — waiting on Model-X gearbox stock", impact: "−₹1,10,000" },
              { driver: "Sunrise Polymers spares order not placed — deal inactive 12 days", impact: "−₹40,000" },
              { driver: "Fewer commissioning invoices raised than the 4-week average", impact: "−₹20,000" },
            ],
          },
          actions: [{ id: "export", label: "Export results" }],
        };
      case "reactivation": {
        const rows = first as { customerId: string; previousPurchases: number; monthsSinceOrder: number; customer: { name: string; owner: string } }[];
        return {
          intent: plan.intent,
          title: "Customers to re-engage",
          headline: { value: `${rows.length} customers`, meta: `${formatLakh(rows.reduce((s, r) => s + r.previousPurchases, 0))} in previous purchases · no order in 6+ months` },
          table: {
            columns: [
              { key: "customer", label: "Customer" },
              { key: "owner", label: "Owner" },
              { key: "spend", label: "Previous purchases", align: "right" },
              { key: "last", label: "Last purchase", align: "right" },
            ],
            rows: rows.map((r) => ({ customer: r.customer.name, owner: r.customer.owner, spend: formatLakh(r.previousPurchases), last: `${r.monthsSinceOrder} months ago` })),
          },
          actions: [
            { id: "prepare_outreach", label: "Prepare reactivation outreach", primary: true },
            { id: "export", label: "Export results" },
          ],
          subjects: rows.map((r) => r.customerId),
        };
      }
      case "low_stock": {
        const rows = first as { sku: string; name: string; onHand: number; minimum: number; daysToMinimum: number; belowMinimum: boolean }[];
        return {
          intent: plan.intent,
          title: "Low-stock products",
          headline: { value: `${rows.length} SKUs`, meta: `of ${metrics.inventorySkus} · 2 below minimum, 1 projected within 6 days` },
          table: {
            columns: [
              { key: "sku", label: "SKU", mono: true },
              { key: "name", label: "Product" },
              { key: "onHand", label: "On hand", align: "right" },
              { key: "minimum", label: "Minimum", align: "right" },
              { key: "status", label: "Status", align: "right" },
            ],
            rows: rows.map((r) => ({ sku: r.sku, name: r.name, onHand: String(r.onHand), minimum: String(r.minimum), status: r.belowMinimum ? "Below minimum" : `${r.daysToMinimum} days to minimum` })),
          },
          paragraphs: ["A requisition for 120 Model-X gearbox assemblies (PR-0231, ₹6,12,000) is awaiting your approval."],
          actions: [
            { id: "open_approvals", label: "Review requisition", primary: true },
            { id: "export", label: "Export results" },
          ],
        };
      }
      case "follow_ups":
        return {
          intent: plan.intent,
          title: "Follow-ups for today",
          paragraphs: [
            "Tata Engineering quotation QT-2042 (₹8,83,584) is waiting on your discount decision. Rahul created it 2 minutes ago.",
            "ABC Industries has not responded to the 31 Aug reminder on INV-318 (₹4,82,000, 67 days overdue). A second reminder is awaiting approval.",
            "Four deals worth ₹14.2L have had no activity for 10+ days. Nova Autoparts (₹4.6L, 14 days) is the largest.",
            "Model-X gearbox stock reaches minimum in 6 days. Requisition PR-0231 is awaiting approval.",
          ],
          actions: [
            { id: "open_approvals", label: "Open approvals", primary: true },
            { id: "open_finance", label: "Open finance view" },
          ],
        };
      case "customer_lookup": {
        const c = (first as { id: string }[])[0] ? getCustomer((first as { id: string }[])[0].id)! : undefined;
        if (!c) return { intent: plan.intent, title: "No matching customer", paragraphs: ["No company in HubSpot matched that name."], actions: [] };
        return {
          intent: plan.intent,
          title: c.name,
          headline: { value: formatLakh(c.lifetimeValue), meta: `Lifetime value · ${formatLakh(c.last12Months)} in the last 12 months` },
          table: {
            columns: [
              { key: "field", label: "Field" },
              { key: "value", label: "Value", align: "right" },
            ],
            rows: [
              { field: "Segment", value: `${c.segment} · ${c.city}` },
              { field: "Account owner", value: c.owner },
              { field: "Primary contact", value: c.contact.name },
              { field: "Last order", value: c.lastOrder },
              { field: "Payment terms", value: c.paymentTerms },
            ],
          },
          actions: [{ id: "export", label: "Export results" }],
        };
      }
      default:
        return {
          intent: "unknown",
          title: "Not mapped to a connected source",
          paragraphs: [
            "Operator could not match this request to a tool in your connected systems. Try asking about customers, receivables, deals, revenue or inventory.",
          ],
          actions: [],
        };
    }
  }
}

export const modelProvider: ModelProvider = new MockProvider();
