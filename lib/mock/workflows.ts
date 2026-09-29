export type StepKind = "trigger" | "tool" | "generate" | "approval" | "notify";

export interface WorkflowStep {
  id: string;
  kind: StepKind;
  title: string;
  description: string;
  /** Tool id for tool steps. */
  toolId?: string;
  /** Input used when the workflow is run manually from Operator. */
  input?: Record<string, unknown>;
  config: { label: string; value: string }[];
  /** Metadata shown while the step runs, e.g. "Retrieved 6 invoices". */
  runSummary: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  agentId: string;
  status: "active" | "paused";
  executions: number;
  successRate: number;
  lastRun: string;
  avgDuration: string;
  steps: WorkflowStep[];
}

export const workflows: Workflow[] = [
  {
    id: "overdue-invoice-follow-up",
    name: "Overdue Invoice Follow-up",
    description: "Prepares a reminder for each invoice that crosses 30 days overdue and holds it for review before sending.",
    trigger: "Invoice >30 days overdue",
    agentId: "finance-assistant",
    status: "active",
    executions: 182,
    successRate: 98.9,
    lastRun: "12 minutes ago",
    avgDuration: "3.4s",
    steps: [
      { id: "t", kind: "trigger", title: "Invoice >30 days overdue", description: "Evaluated hourly against unpaid invoices in the ERP.", config: [{ label: "Source", value: "Custom ERP · invoices" }, { label: "Condition", value: "days_overdue > 30 and no reminder in 7 days" }, { label: "Schedule", value: "Hourly, 9:00–18:00" }], runSummary: "3 invoices matched" },
      { id: "s1", kind: "tool", title: "Get overdue invoice", description: "Fetch invoice, line items and due date.", toolId: "erp.get_invoice", input: { invoice_id: "INV-327" }, config: [{ label: "invoice_id", value: "{{trigger.invoice_id}}" }], runSummary: "Retrieved 3 invoices" },
      { id: "s2", kind: "tool", title: "Retrieve customer", description: "Billing contact, payment terms and history.", toolId: "erp.get_customer", input: { customer_ids: ["c_delta", "c_metro"] }, config: [{ label: "customer_id", value: "{{invoice.customer_id}}" }], runSummary: "Retrieved 3 billing contacts" },
      { id: "s3", kind: "generate", title: "Generate reminder", description: "Drafts a courteous reminder in the finance team's tone.", toolId: "gmail.draft_email", input: { to: "finance@deltaeng.example", subject: "Payment reminder — INV-327", company: "Delta Engineering" }, config: [{ label: "Template", value: "Payment reminder v3" }, { label: "Tone", value: "Courteous, factual" }, { label: "Mailbox", value: "accounts@" }], runSummary: "Prepared 3 drafts" },
      { id: "s4", kind: "approval", title: "Approval", description: "Finance reviews every outbound email. 60+ day reminders go to the owner.", config: [{ label: "Approver", value: "Anita Rao · Pawan for 60+ days" }, { label: "Timeout", value: "24 hours, then escalate" }], runSummary: "Approval requested" },
      { id: "s5", kind: "tool", title: "Send email", description: "Sends the approved reminder from accounts@.", toolId: "gmail.send_email", config: [{ label: "Mailbox", value: "accounts@" }, { label: "CC", value: "Account owner" }], runSummary: "Waiting for approval" },
      { id: "s6", kind: "tool", title: "Update CRM", description: "Logs the reminder on the HubSpot company timeline.", toolId: "hubspot.log_activity", config: [{ label: "type", value: "email" }], runSummary: "Waiting for approval" },
    ],
  },
  {
    id: "stalled-deal-follow-up",
    name: "Stalled Deal Follow-up",
    description: "Flags deals with no recorded activity for 10 days and sends the owner an account summary.",
    trigger: "No activity for 10 days",
    agentId: "sales-assistant",
    status: "active",
    executions: 64,
    successRate: 100,
    lastRun: "Today, 9:00 AM",
    avgDuration: "4.1s",
    steps: [
      { id: "t", kind: "trigger", title: "No activity for 10 days", description: "Evaluated daily at 9:00 AM against open deals.", config: [{ label: "Source", value: "HubSpot · deals" }, { label: "Condition", value: "days_since_activity ≥ 10 and stage ≠ closed" }], runSummary: "4 deals matched" },
      { id: "s1", kind: "tool", title: "Get deal", description: "Deal stage, value, owner and next step.", toolId: "hubspot.get_deals", input: { inactive_days: 10 }, config: [{ label: "inactive_days", value: "10" }], runSummary: "Retrieved 4 deals" },
      { id: "s2", kind: "tool", title: "Get customer history", description: "Company record, recent orders and last touchpoints from HubSpot.", toolId: "hubspot.search_customer", input: { query: "Nova Autoparts" }, config: [{ label: "query", value: "{{deal.company}}" }], runSummary: "Retrieved order history" },
      { id: "s3", kind: "generate", title: "Prepare account summary", description: "Summarises recent orders, open quotes and last touchpoints.", config: [{ label: "Format", value: "Account summary v2" }], runSummary: "Prepared 4 summaries" },
      { id: "s4", kind: "notify", title: "Notify account owner", description: "Creates a HubSpot task for the owner with the summary attached.", toolId: "hubspot.create_task", input: { deal_id: "D-1184", owner: "Rahul Mehta", title: "Review stalled deal: CNC retrofit — Line 3", due: "Today" }, config: [{ label: "Due", value: "Today" }], runSummary: "Created 4 tasks" },
    ],
  },
  {
    id: "daily-brief",
    name: "Daily Management Brief",
    description: "Compiles revenue, pipeline, receivables and inventory into the leadership brief.",
    trigger: "Weekdays at 8:30",
    agentId: "management-brief",
    status: "active",
    executions: 21,
    successRate: 100,
    lastRun: "Today, 8:30 AM",
    avgDuration: "6.8s",
    steps: [
      { id: "t", kind: "trigger", title: "Weekdays at 8:30", description: "Runs Monday to Friday, Asia/Kolkata.", config: [{ label: "Cron", value: "30 8 * * 1-5" }, { label: "Timezone", value: "Asia/Kolkata" }], runSummary: "Scheduled run" },
      { id: "s1", kind: "tool", title: "Fetch revenue", description: "Month-to-date revenue against last month.", toolId: "erp.get_revenue_summary", input: { period: "month" }, config: [{ label: "period", value: "month" }], runSummary: "Revenue ₹38.4L MTD" },
      { id: "s2", kind: "tool", title: "Fetch pipeline", description: "Open deals and stalled opportunities.", toolId: "postgres.get_pipeline_snapshot", input: { as_of: "2026-09-29" }, config: [{ label: "as_of", value: "today" }], runSummary: "18 open deals" },
      { id: "s3", kind: "tool", title: "Fetch receivables", description: "Receivables ageing buckets.", toolId: "postgres.get_receivables_aging", input: { as_of: "2026-09-29" }, config: [{ label: "as_of", value: "today" }], runSummary: "₹8.4L overdue" },
      { id: "s4", kind: "tool", title: "Fetch inventory alerts", description: "SKUs projected below minimum.", toolId: "erp.get_stock_forecast", input: { sku: "MX-GB-220", horizon_days: 10 }, config: [{ label: "horizon_days", value: "10" }], runSummary: "1 SKU at risk" },
      { id: "s5", kind: "generate", title: "Generate brief", description: "Facts and figures only; no recommendations.", config: [{ label: "Delivery", value: "Overview · leadership@" }], runSummary: "Brief published" },
    ],
  },
];

export function getWorkflow(id: string) {
  return workflows.find((w) => w.id === id);
}
