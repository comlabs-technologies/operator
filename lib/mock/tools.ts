import type { ApprovalPolicy, ToolDefinition, ToolInputSchema } from "@/lib/mcp/types";

/**
 * Tool catalogue for the Acme Industrial workspace.
 * Execution counts sum to the workspace total (12,842 this month).
 */

const never: ApprovalPolicy = { mode: "never", description: "Executes without review." };
const always = (description: string): ApprovalPolicy => ({ mode: "always", description });

const schema = (
  properties: ToolInputSchema["properties"],
  required: string[] = [],
): ToolInputSchema => ({ type: "object", properties, required });

type Def = Omit<ToolDefinition, "id" | "latency"> & { latency?: [number, number] };

const def = (d: Def): ToolDefinition => ({
  ...d,
  id: `${d.connection}.${d.name}`,
  latency: d.latency ?? (d.type === "read" ? [380, 720] : [560, 900]),
});

export const toolDefinitions: ToolDefinition[] = [
  // HubSpot CRM — 8 tools
  def({ name: "search_customer", connection: "hubspot", type: "read", permission: "sales.customer.read", risk: "low", status: "active", approval: never, executions: 3_482, description: "Search companies by name, owner, segment or purchase history. Returns CRM records with owner and lifecycle stage.", inputSchema: schema({ query: { type: "string", description: "Company name or keyword" }, min_spend_12m: { type: "number", description: "Minimum spend in the previous 12 months (INR)" }, inactive_months: { type: "integer", description: "Months since last order" } }) }),
  def({ name: "get_deals", connection: "hubspot", type: "read", permission: "sales.deal.read", risk: "low", status: "active", approval: never, executions: 312, description: "List open deals, optionally filtered by owner, stage or days without activity.", inputSchema: schema({ inactive_days: { type: "integer" }, owner: { type: "string" }, stage: { type: "string" } }) }),
  def({ name: "update_deal", connection: "hubspot", type: "write", permission: "sales.deal.write", risk: "low", status: "active", approval: never, executions: 318, description: "Update deal stage, amount, close date or next step.", inputSchema: schema({ deal_id: { type: "string" }, stage: { type: "string" }, next_step: { type: "string" } }, ["deal_id"]) }),
  def({ name: "create_task", connection: "hubspot", type: "write", permission: "sales.task.create", risk: "low", status: "active", approval: never, executions: 204, description: "Create a follow-up task for a deal owner.", inputSchema: schema({ deal_id: { type: "string" }, owner: { type: "string" }, due: { type: "string" }, title: { type: "string" } }, ["deal_id", "owner", "title"]) }),
  def({ name: "log_activity", connection: "hubspot", type: "write", permission: "sales.activity.write", risk: "low", status: "active", approval: never, executions: 214, description: "Record an email, call or note on a company timeline.", inputSchema: schema({ company: { type: "string" }, type: { type: "string", enum: ["email", "call", "note"] }, body: { type: "string" } }, ["company", "type"]) }),
  def({ name: "get_contact", connection: "hubspot", type: "read", permission: "sales.customer.read", risk: "low", status: "active", approval: never, executions: 96, description: "Fetch the primary contact for a company.", inputSchema: schema({ company: { type: "string" } }, ["company"]) }),
  def({ name: "get_company_timeline", connection: "hubspot", type: "read", permission: "sales.customer.read", risk: "low", status: "active", approval: never, executions: 64, description: "Return recent emails, calls, meetings and notes for a company.", inputSchema: schema({ company: { type: "string" }, limit: { type: "integer" } }, ["company"]) }),
  def({ name: "delete_customer", connection: "hubspot", type: "write", permission: "customer.delete", risk: "critical", status: "disabled", approval: always("Disabled at workspace level. Deletions must be made in HubSpot directly."), executions: 0, description: "Permanently delete a company record and its associations.", inputSchema: schema({ company_id: { type: "string" } }, ["company_id"]) }),

  // Custom ERP — 14 tools
  def({ name: "check_inventory", connection: "erp", type: "read", permission: "inventory.read", risk: "low", status: "active", approval: never, executions: 2_190, description: "Current stock, minimum levels and days of cover for one SKU or all SKUs below minimum.", inputSchema: schema({ sku: { type: "string" }, below_minimum: { type: "boolean" } }) }),
  def({ name: "create_quote", connection: "erp", type: "write", permission: "sales.quote.create", risk: "medium", status: "active", approval: { mode: "conditional", description: "Requires manager approval when the discount exceeds the requester's limit (5%).", when: (input) => Number(input.discount_pct ?? 0) > 5 }, executions: 1_388, description: "Create a customer quotation from price list items with optional discount.", inputSchema: schema({ customer_id: { type: "string" }, lines: { type: "array", items: { type: "object" } }, discount_pct: { type: "number" }, valid_days: { type: "integer" } }, ["customer_id", "lines"]) }),
  def({ name: "get_customer", connection: "erp", type: "read", permission: "finance.customer.read", risk: "low", status: "active", approval: never, executions: 212, description: "Billing profile, credit limit, payment terms and order history for a customer.", inputSchema: schema({ customer_id: { type: "string" } }, ["customer_id"]) }),
  def({ name: "get_invoice", connection: "erp", type: "read", permission: "finance.invoice.read", risk: "low", status: "active", approval: never, executions: 238, description: "Retrieve an invoice with line items, due date and payment status.", inputSchema: schema({ invoice_id: { type: "string" } }, ["invoice_id"]) }),
  def({ name: "get_pricing", connection: "erp", type: "read", permission: "sales.pricing.read", risk: "low", status: "active", approval: never, executions: 196, description: "Price list and contract pricing for SKUs and a customer.", inputSchema: schema({ customer_id: { type: "string" }, skus: { type: "array", items: { type: "string" } } }) }),
  def({ name: "get_orders", connection: "erp", type: "read", permission: "sales.order.read", risk: "low", status: "active", approval: never, executions: 188, description: "Sales orders for a customer or date range.", inputSchema: schema({ customer_id: { type: "string" }, from: { type: "string" }, to: { type: "string" } }) }),
  def({ name: "get_outstanding_invoices", connection: "erp", type: "read", permission: "finance.invoice.read", risk: "low", status: "active", approval: never, executions: 182, description: "Unpaid invoices past due, with ageing in days.", inputSchema: schema({ min_days_overdue: { type: "integer" } }) }),
  def({ name: "get_stock_forecast", connection: "erp", type: "read", permission: "inventory.read", risk: "low", status: "active", approval: never, executions: 164, description: "Projected stock position from open orders and trailing consumption.", inputSchema: schema({ sku: { type: "string" }, horizon_days: { type: "integer" } }) }),
  def({ name: "create_order", connection: "erp", type: "write", permission: "sales.order.create", risk: "medium", status: "approval_required", approval: always("Every sales order is confirmed by a human before it is created."), executions: 96, description: "Convert an approved quotation into a sales order.", inputSchema: schema({ quote_id: { type: "string" } }, ["quote_id"]) }),
  def({ name: "get_revenue_summary", connection: "erp", type: "read", permission: "finance.revenue.read", risk: "low", status: "active", approval: never, executions: 88, description: "Booked revenue by period, customer and product line.", inputSchema: schema({ period: { type: "string", enum: ["week", "month", "quarter"] } }) }),
  def({ name: "update_invoice_status", connection: "erp", type: "write", permission: "finance.invoice.write", risk: "medium", status: "active", approval: never, executions: 54, description: "Record reminders sent, promises to pay and disputes against an invoice.", inputSchema: schema({ invoice_id: { type: "string" }, status: { type: "string" } }, ["invoice_id", "status"]) }),
  def({ name: "create_purchase_requisition", connection: "erp", type: "write", permission: "purchasing.requisition.create", risk: "medium", status: "approval_required", approval: always("Requisitions above ₹5,00,000 require owner approval."), executions: 22, description: "Raise a purchase requisition for a SKU against the preferred supplier.", inputSchema: schema({ sku: { type: "string" }, qty: { type: "integer" }, supplier: { type: "string" } }, ["sku", "qty"]) }),
  def({ name: "create_credit_note", connection: "erp", type: "write", permission: "finance.credit_note.create", risk: "high", status: "approval_required", approval: always("Every credit note is reviewed by finance."), executions: 18, description: "Issue a credit note against an invoice.", inputSchema: schema({ invoice_id: { type: "string" }, amount: { type: "number" }, reason: { type: "string" } }, ["invoice_id", "amount", "reason"]) }),
  def({ name: "issue_refund", connection: "erp", type: "write", permission: "finance.refund", risk: "high", status: "restricted", approval: always("Restricted to the finance team. Agents cannot request refunds."), executions: 12, description: "Refund a paid invoice to the customer's bank account.", inputSchema: schema({ invoice_id: { type: "string" }, amount: { type: "number" } }, ["invoice_id", "amount"]) }),

  // PostgreSQL — 11 tools, read-only role
  def({ name: "get_sales_summary", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 118, description: "Daily sales aggregates from the warehouse.", inputSchema: schema({ from: { type: "string" }, to: { type: "string" } }) }),
  def({ name: "get_receivables_aging", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 104, description: "Receivables bucketed by 0–30, 31–45, 46–60 and 60+ days.", inputSchema: schema({ as_of: { type: "string" } }) }),
  def({ name: "run_readonly_query", connection: "postgres", type: "read", permission: "analytics.query", risk: "medium", status: "active", approval: never, executions: 96, description: "Run a parameterised SELECT against approved analytics views.", inputSchema: schema({ view: { type: "string" }, filters: { type: "object" } }, ["view"]) }),
  def({ name: "get_inventory_levels", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 84, description: "Historical stock levels for trend analysis.", inputSchema: schema({ sku: { type: "string" } }) }),
  def({ name: "get_customer_ltv", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 72, description: "Lifetime and trailing-12-month value per customer.", inputSchema: schema({ customer_id: { type: "string" } }) }),
  def({ name: "get_pipeline_snapshot", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 66, description: "Pipeline value by stage and owner at a point in time.", inputSchema: schema({ as_of: { type: "string" } }) }),
  def({ name: "get_order_history", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 58, description: "Order history across all customers for cohort analysis.", inputSchema: schema({ months: { type: "integer" } }) }),
  def({ name: "get_top_customers", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 41, description: "Customers ranked by revenue for a period.", inputSchema: schema({ period: { type: "string" }, limit: { type: "integer" } }) }),
  def({ name: "get_margin_by_product", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 34, description: "Gross margin by product line.", inputSchema: schema({ period: { type: "string" } }) }),
  def({ name: "get_churn_signals", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 29, description: "Customers whose ordering cadence has dropped against their history.", inputSchema: schema({ min_spend: { type: "number" }, inactive_months: { type: "integer" } }) }),
  def({ name: "get_kpi_snapshot", connection: "postgres", type: "read", permission: "analytics.read", risk: "low", status: "active", approval: never, executions: 21, description: "Revenue, receivables, pipeline and inventory KPIs in one call.", inputSchema: schema({ as_of: { type: "string" } }) }),

  // Gmail — 6 tools
  def({ name: "send_email", connection: "gmail", type: "write", permission: "email.send", risk: "medium", status: "approval_required", approval: always("Every outbound customer email is reviewed before it is sent."), executions: 824, description: "Send an email from a shared mailbox. Drafts are held for review.", inputSchema: schema({ to: { type: "string" }, subject: { type: "string" }, body: { type: "string" }, mailbox: { type: "string", enum: ["sales@", "accounts@"] } }, ["to", "subject", "body"]) }),
  def({ name: "draft_email", connection: "gmail", type: "write", permission: "email.draft", risk: "low", status: "active", approval: never, executions: 318, description: "Create a draft in a shared mailbox without sending it.", inputSchema: schema({ to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, ["to", "subject"]) }),
  def({ name: "search_inbox", connection: "gmail", type: "read", permission: "email.read", risk: "low", status: "active", approval: never, executions: 42, description: "Search shared mailboxes for customer correspondence.", inputSchema: schema({ query: { type: "string" } }, ["query"]) }),
  def({ name: "get_thread", connection: "gmail", type: "read", permission: "email.read", risk: "low", status: "active", approval: never, executions: 40, description: "Read an email thread.", inputSchema: schema({ thread_id: { type: "string" } }, ["thread_id"]) }),
  def({ name: "schedule_email", connection: "gmail", type: "write", permission: "email.send", risk: "medium", status: "approval_required", approval: always("Scheduled sends follow the same review as send_email."), executions: 36, description: "Schedule an approved email for later delivery.", inputSchema: schema({ draft_id: { type: "string" }, send_at: { type: "string" } }, ["draft_id", "send_at"]) }),
  def({ name: "create_label", connection: "gmail", type: "write", permission: "email.organize", risk: "low", status: "active", approval: never, executions: 8, description: "Create or apply a mailbox label.", inputSchema: schema({ name: { type: "string" } }, ["name"]) }),

  // Google Drive — 5 tools
  def({ name: "find_document", connection: "drive", type: "read", permission: "documents.read", risk: "low", status: "active", approval: never, executions: 924, description: "Search indexed documents by title and content.", inputSchema: schema({ query: { type: "string" }, folder: { type: "string" } }, ["query"]) }),
  def({ name: "read_document", connection: "drive", type: "read", permission: "documents.read", risk: "low", status: "active", approval: never, executions: 132, description: "Return the text content of a document.", inputSchema: schema({ file_id: { type: "string" } }, ["file_id"]) }),
  def({ name: "list_folder", connection: "drive", type: "read", permission: "documents.read", risk: "low", status: "active", approval: never, executions: 38, description: "List files in a shared folder.", inputSchema: schema({ folder: { type: "string" } }, ["folder"]) }),
  def({ name: "create_document", connection: "drive", type: "write", permission: "documents.write", risk: "low", status: "active", approval: never, executions: 14, description: "Create a document from generated content, e.g. an account summary.", inputSchema: schema({ title: { type: "string" }, folder: { type: "string" }, content: { type: "string" } }, ["title", "content"]) }),
  def({ name: "share_document", connection: "drive", type: "write", permission: "documents.share", risk: "high", status: "restricted", approval: always("External sharing is restricted to workspace admins."), executions: 5, description: "Share a document with an external email address.", inputSchema: schema({ file_id: { type: "string" }, email: { type: "string" } }, ["file_id", "email"]) }),
];

export const toolCategory: Record<string, string> = {
  hubspot: "CRM",
  erp: "ERP",
  postgres: "Analytics",
  gmail: "Email",
  drive: "Documents",
};
