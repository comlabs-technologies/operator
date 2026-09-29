import type { ConnectionId } from "@/lib/mcp/types";

export type ToolAccess = "allowed" | "approval" | "blocked";

export interface AgentDefinition {
  id: string;
  name: string;
  purpose: string;
  owner: string;
  connections: ConnectionId[];
  /** Tool id → access level. Tools not listed are not visible to the agent. */
  tools: Record<string, ToolAccess>;
  readOnly: boolean;
  schedule?: string;
  executions: number;
  successRate: number;
  lastRun: string;
  status: "active" | "paused";
  instructions: string;
  guardrails: { label: string; value: string }[];
  usage: number[];
}

export const agents: AgentDefinition[] = [
  {
    id: "sales-assistant",
    name: "Sales Assistant",
    purpose: "Helps sales teams research customers, prepare quotations, and maintain CRM activity.",
    owner: "Priya Nair",
    connections: ["hubspot", "erp", "gmail", "drive"],
    tools: {
      "hubspot.search_customer": "allowed",
      "hubspot.get_deals": "allowed",
      "hubspot.update_deal": "allowed",
      "hubspot.create_task": "allowed",
      "erp.get_pricing": "allowed",
      "erp.check_inventory": "allowed",
      "gmail.draft_email": "allowed",
      "drive.find_document": "allowed",
      "erp.create_quote": "approval",
      "erp.create_order": "approval",
      "gmail.send_email": "approval",
      "hubspot.delete_customer": "blocked",
    },
    readOnly: false,
    executions: 4_280,
    successRate: 98.4,
    lastRun: "2 minutes ago",
    status: "active",
    instructions:
      "You assist the sales team with customer research, quotations, pipeline management and follow-ups. Never send an email without confirmation. Discounts above 5% require manager approval.",
    guardrails: [
      { label: "Discount limit", value: "5% without approval" },
      { label: "Outbound email", value: "Always reviewed" },
      { label: "Record deletion", value: "Blocked" },
      { label: "Runs as", value: "Requesting user" },
    ],
    usage: [118, 132, 141, 126, 152, 88, 64, 139, 147, 158, 162, 171, 92, 71, 149, 156, 168, 173, 181, 97, 74, 162, 170, 178, 184, 191, 102, 80, 176, 169],
  },
  {
    id: "finance-assistant",
    name: "Finance Assistant",
    purpose: "Monitors receivables, prepares payment reminders and answers billing questions from finance data.",
    owner: "Anita Rao",
    connections: ["erp", "postgres", "gmail"],
    tools: {
      "erp.get_outstanding_invoices": "allowed",
      "erp.get_invoice": "allowed",
      "erp.get_customer": "allowed",
      "postgres.get_receivables_aging": "allowed",
      "gmail.draft_email": "allowed",
      "gmail.send_email": "approval",
      "erp.create_credit_note": "approval",
      "erp.issue_refund": "blocked",
    },
    readOnly: false,
    executions: 2_194,
    successRate: 97.9,
    lastRun: "11 minutes ago",
    status: "active",
    instructions:
      "You support the finance team with receivables, invoice questions and payment follow-ups. Use a courteous, factual tone with customers. Reminders for invoices more than 60 days overdue require owner approval. Never issue refunds.",
    guardrails: [
      { label: "Outbound email", value: "Always reviewed" },
      { label: "60+ day reminders", value: "Owner approval" },
      { label: "Refunds", value: "Blocked" },
      { label: "Runs as", value: "Service account" },
    ],
    usage: [61, 66, 72, 70, 78, 41, 30, 69, 74, 81, 77, 84, 44, 32, 70, 76, 79, 83, 88, 46, 35, 74, 80, 86, 83, 90, 48, 36, 85, 82],
  },
  {
    id: "operations-assistant",
    name: "Operations Assistant",
    purpose: "Watches stock levels against open orders and raises purchase requisitions before shortages.",
    owner: "Pawan",
    connections: ["erp", "postgres", "drive"],
    tools: {
      "erp.check_inventory": "allowed",
      "erp.get_stock_forecast": "allowed",
      "erp.get_orders": "allowed",
      "postgres.get_inventory_levels": "allowed",
      "drive.find_document": "allowed",
      "erp.create_purchase_requisition": "approval",
    },
    readOnly: false,
    executions: 1_862,
    successRate: 99.1,
    lastRun: "51 minutes ago",
    status: "active",
    instructions:
      "You monitor inventory for Acme Industrial. Flag any SKU projected to fall below minimum stock within 10 days, and prepare purchase requisitions against the preferred supplier. Requisitions above ₹5,00,000 require owner approval.",
    guardrails: [
      { label: "Requisition limit", value: "₹5,00,000" },
      { label: "Supplier", value: "Preferred list only" },
      { label: "Runs as", value: "Service account" },
    ],
    usage: [52, 58, 61, 59, 66, 22, 14, 60, 63, 67, 64, 70, 25, 16, 62, 65, 68, 71, 73, 27, 18, 66, 69, 72, 70, 75, 29, 19, 71, 68],
  },
  {
    id: "management-brief",
    name: "Management Brief",
    purpose: "Compiles the daily brief on revenue, pipeline, receivables and inventory for leadership.",
    owner: "Pawan",
    connections: ["hubspot", "erp", "postgres"],
    tools: {
      "erp.get_revenue_summary": "allowed",
      "erp.get_stock_forecast": "allowed",
      "hubspot.get_deals": "allowed",
      "postgres.get_pipeline_snapshot": "allowed",
      "postgres.get_receivables_aging": "allowed",
      "postgres.get_kpi_snapshot": "allowed",
    },
    readOnly: true,
    schedule: "8:30 AM weekdays",
    executions: 136,
    successRate: 100,
    lastRun: "Today, 8:30 AM",
    status: "active",
    instructions:
      "Every weekday at 8:30 AM, summarise revenue against last month, receivables, stalled pipeline and inventory risks for the leadership team. State facts and figures; do not recommend decisions. Read-only.",
    guardrails: [
      { label: "Access", value: "Read-only" },
      { label: "Schedule", value: "8:30 AM weekdays" },
      { label: "Delivery", value: "Overview · Email to leadership" },
    ],
    usage: [6, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6, 6, 0, 0, 6, 6],
  },
];

export function getAgent(id: string) {
  return agents.find((a) => a.id === id);
}

export function agentToolCounts(agent: AgentDefinition) {
  const values = Object.values(agent.tools);
  return {
    total: values.length,
    allowed: values.filter((v) => v === "allowed").length,
    approval: values.filter((v) => v === "approval").length,
    blocked: values.filter((v) => v === "blocked").length,
  };
}
