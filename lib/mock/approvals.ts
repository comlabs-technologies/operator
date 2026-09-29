import { formatINR, minutesAgo } from "@/lib/utils";
import { lowStock, overdueInvoices, tataQuote } from "./company";
import { paymentReminder, type EmailDraft } from "./emails";

export type ApprovalKind =
  | "quotation"
  | "payment_reminder"
  | "purchase_requisition"
  | "credit_note"
  | "outreach";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes_requested" | "superseded";

export interface ApprovalContextRow {
  label: string;
  value: string;
  hint?: string;
  tone?: "warning" | "neutral";
}

export interface Approval {
  id: string;
  kind: ApprovalKind;
  title: string;
  subject: string;
  reference: string;
  amount?: number;
  detail?: string;
  requestedBy: string;
  agentId: string;
  reason: string;
  createdAt: string;
  status: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
  /** Label for the primary action, e.g. "Approve & send". */
  actionLabel: string;
  /** The held tool calls, replayed through the gateway once approved. */
  action: { toolId: string; calls: Record<string, unknown>[] };
  context: ApprovalContextRow[];
  summary?: string;
  emails?: EmailDraft[];
  /** Invoice or customer references this request covers, used to supersede duplicates. */
  covers?: string[];
}

export const approvalKindLabel: Record<ApprovalKind, string> = {
  quotation: "Quotation",
  payment_reminder: "Payment reminder",
  purchase_requisition: "Purchase requisition",
  credit_note: "Credit note",
  outreach: "Customer outreach",
};

const abc = overdueInvoices[0];
const modelX = lowStock[0];

export const seedApprovals: Approval[] = [
  {
    id: "APR-1045",
    kind: "quotation",
    title: "Quotation",
    subject: "Tata Engineering",
    reference: tataQuote.id,
    amount: tataQuote.total,
    detail: `${tataQuote.discountPct}% discount`,
    requestedBy: "Rahul Mehta",
    agentId: "sales-assistant",
    reason: `Discount of ${tataQuote.discountPct}% exceeds automatic approval threshold.`,
    createdAt: minutesAgo(2),
    status: "pending",
    actionLabel: "Approve",
    action: {
      toolId: "erp.create_quote",
      calls: [{ customer_id: "c_tata", quote_id: tataQuote.id, discount_pct: tataQuote.discountPct, valid_days: 15 }],
    },
    context: [
      { label: "Customer", value: "Tata Engineering", hint: "Enterprise · Jamshedpur · since 2019" },
      { label: "Previous purchases", value: "₹24.8L", hint: "Last 12 months · 9 orders" },
      { label: "Current pricing", value: formatINR(tataQuote.listValue), hint: "List value before discount" },
      { label: "Discount", value: `${tataQuote.discountPct}% · ${formatINR(tataQuote.discount)}`, hint: `Rahul's limit is ${tataQuote.autoApprovalLimitPct}%`, tone: "warning" },
      { label: "Inventory", value: `${modelX.onHand} of 96 Model-X in stock`, hint: "Requisition for 120 units pending", tone: "warning" },
      { label: "Payment terms", value: "Net 45", hint: "No overdue invoices" },
    ],
    summary:
      "The requested discount is 1.2 percentage points above Rahul's automatic approval limit. The customer has placed ₹24.8L in orders over the past 12 months.",
  },
  {
    id: "APR-1044",
    kind: "purchase_requisition",
    title: "Purchase requisition",
    subject: "Model-X gearbox assembly",
    reference: "PR-0231",
    amount: 120 * modelX.unitCost,
    detail: "120 units · Sona Drives",
    requestedBy: "Operations Assistant",
    agentId: "operations-assistant",
    reason: "Requisitions above ₹5,00,000 require owner approval.",
    createdAt: minutesAgo(63),
    status: "pending",
    actionLabel: "Approve",
    action: {
      toolId: "erp.create_purchase_requisition",
      calls: [{ sku: modelX.sku, qty: 120, supplier: "Sona Drives Pvt Ltd" }],
    },
    context: [
      { label: "SKU", value: `${modelX.sku} · ${modelX.name}` },
      { label: "On hand", value: `${modelX.onHand} units`, hint: `Minimum ${modelX.minimum}` },
      { label: "Projected", value: "Below minimum in 6 days", hint: `${modelX.dailyUsage}/day trailing usage`, tone: "warning" },
      { label: "Open demand", value: "96 units", hint: "Tata Engineering QT-2042" },
      { label: "Supplier", value: "Sona Drives Pvt Ltd", hint: "Preferred · 18 day lead time" },
      { label: "Unit cost", value: formatINR(modelX.unitCost), hint: "Unchanged from last PO" },
    ],
    summary:
      "At current consumption Model-X stock reaches its minimum in six days. The pending Tata Engineering quotation would require 96 units against 38 on hand.",
  },
  {
    id: "APR-1043",
    kind: "credit_note",
    title: "Credit note",
    subject: "Orion Pumps",
    reference: "INV-356",
    amount: 8_400,
    detail: "Short shipment",
    requestedBy: "Finance Assistant",
    agentId: "finance-assistant",
    reason: "Every credit note is reviewed by finance.",
    createdAt: minutesAgo(98),
    status: "pending",
    actionLabel: "Approve",
    action: {
      toolId: "erp.create_credit_note",
      calls: [{ invoice_id: "INV-356", amount: 8_400, reason: "Short shipment — 12 seal kits" }],
    },
    context: [
      { label: "Invoice", value: "INV-356 · ₹22,000", hint: "31 days overdue" },
      { label: "Claim", value: "12 seal kits short", hint: "Customer email, 26 Sep" },
      { label: "Dispatch record", value: "GRN shows 108 of 120", hint: "Chakan WH-1" },
      { label: "Credit value", value: "₹8,400", hint: "12 × ₹700 contract price" },
    ],
    summary:
      "The customer's claim matches the goods receipt note, which records 108 of 120 kits received. The credit note would reduce the invoice balance to ₹13,600.",
  },
  {
    id: "APR-1041",
    kind: "payment_reminder",
    title: "Payment reminder",
    subject: "ABC Industries",
    reference: abc.id,
    amount: abc.amount,
    detail: `${abc.daysOverdue} days overdue`,
    requestedBy: "Finance Assistant",
    agentId: "finance-assistant",
    reason: "Reminders for invoices more than 60 days overdue require owner approval.",
    createdAt: minutesAgo(18 * 60 + 23),
    status: "pending",
    actionLabel: "Approve & send",
    action: { toolId: "gmail.send_email", calls: [{ ...emailCall(paymentReminder(abc)) }] },
    context: [
      { label: "Invoice", value: `${abc.id} · ${formatINR(abc.amount)}`, hint: `Issued ${abc.issued}` },
      { label: "Overdue", value: `${abc.daysOverdue} days`, tone: "warning" },
      { label: "Last reminder", value: abc.lastReminder!, hint: "No reply received" },
      { label: "Account owner", value: "Vikram Iyer" },
    ],
    emails: [paymentReminder(abc)],
    covers: [abc.id],
  },
  {
    id: "APR-1039",
    kind: "payment_reminder",
    title: "Payment reminders",
    subject: "3 customers",
    reference: "INV-342 +2",
    amount: 95_500,
    detail: "31–38 days overdue",
    requestedBy: "Finance Assistant",
    agentId: "finance-assistant",
    reason: "Every outbound customer email is reviewed before it is sent.",
    createdAt: minutesAgo(12),
    status: "approved",
    decidedBy: "Anita Rao",
    decidedAt: minutesAgo(8),
    actionLabel: "Approve & send",
    action: { toolId: "gmail.send_email", calls: overdueInvoices.slice(3).map((i) => emailCall(paymentReminder(i))) },
    context: [{ label: "Invoices", value: "INV-342, INV-349, INV-356" }],
    emails: overdueInvoices.slice(3).map(paymentReminder),
    covers: overdueInvoices.slice(3).map((i) => i.id),
  },
  {
    id: "APR-1038",
    kind: "quotation",
    title: "Customer discount",
    subject: "Tata Engineering",
    reference: "QT-2038",
    amount: 3_12_000,
    detail: "4.5% discount",
    requestedBy: "Rahul Mehta",
    agentId: "sales-assistant",
    reason: "Discount on a rate-contract item requires Head of Sales approval.",
    createdAt: minutesAgo(41),
    status: "approved",
    decidedBy: "Priya Nair",
    decidedAt: minutesAgo(28),
    actionLabel: "Approve",
    action: { toolId: "erp.create_quote", calls: [] },
    context: [{ label: "Discount", value: "4.5%" }],
  },
  {
    id: "APR-1034",
    kind: "outreach",
    title: "Customer email",
    subject: "Sunrise Polymers",
    reference: "D-1191",
    detail: "Revised pricing proposal",
    requestedBy: "Vikram Iyer",
    agentId: "sales-assistant",
    reason: "Every outbound customer email is reviewed before it is sent.",
    createdAt: minutesAgo(26 * 60),
    status: "rejected",
    decidedBy: "Priya Nair",
    decidedAt: minutesAgo(25 * 60 + 12),
    note: "Hold until the revised rate contract is signed.",
    actionLabel: "Approve & send",
    action: { toolId: "gmail.send_email", calls: [] },
    context: [{ label: "Deal", value: "Annual spares contract · ₹3.8L" }],
  },
];

export function emailCall(draft: EmailDraft) {
  return { to: draft.to, subject: draft.subject, body: draft.body, mailbox: draft.mailbox, company: draft.company, ref: draft.ref };
}
