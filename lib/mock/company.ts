/**
 * Acme Industrial — the demo workspace.
 * All headline figures are derived from the underlying records below so the
 * numbers on every screen agree with each other.
 */

export interface Person {
  id: string;
  name: string;
  firstName: string;
  role: string;
  email: string;
}

export const currentUser: Person = {
  id: "u_pawan",
  name: "Pawan",
  firstName: "Pawan",
  role: "Managing Director",
  email: "pawan@acmeindustrial.in",
};

export const team: Person[] = [
  currentUser,
  { id: "u_rahul", name: "Rahul Mehta", firstName: "Rahul", role: "Sales Executive", email: "rahul@acmeindustrial.in" },
  { id: "u_priya", name: "Priya Nair", firstName: "Priya", role: "Head of Sales", email: "priya@acmeindustrial.in" },
  { id: "u_anita", name: "Anita Rao", firstName: "Anita", role: "Finance Manager", email: "anita@acmeindustrial.in" },
  { id: "u_vikram", name: "Vikram Iyer", firstName: "Vikram", role: "Key Accounts", email: "vikram@acmeindustrial.in" },
  { id: "u_neha", name: "Neha Kulkarni", firstName: "Neha", role: "Sales Executive", email: "neha@acmeindustrial.in" },
];

export const company = {
  name: "Acme Industrial",
  industry: "Industrial machinery",
  plan: "Business",
  region: "Pune, India",
};

export interface Customer {
  id: string;
  name: string;
  city: string;
  segment: string;
  owner: string;
  contact: { name: string; email: string };
  lifetimeValue: number;
  last12Months: number;
  lastOrder: string;
  paymentTerms: string;
}

export const customers: Customer[] = [
  { id: "c_tata", name: "Tata Engineering", city: "Jamshedpur", segment: "Enterprise", owner: "Rahul Mehta", contact: { name: "Suresh Menon", email: "s.menon@tataeng.example" }, lifetimeValue: 62_40_000, last12Months: 24_80_000, lastOrder: "12 Sep 2026", paymentTerms: "Net 45" },
  { id: "c_abc", name: "ABC Industries", city: "Nashik", segment: "Mid-market", owner: "Vikram Iyer", contact: { name: "Rajesh Gupta", email: "accounts@abcindustries.example" }, lifetimeValue: 21_60_000, last12Months: 9_40_000, lastOrder: "24 Jun 2026", paymentTerms: "Net 30" },
  { id: "c_delta", name: "Delta Engineering", city: "Chennai", segment: "Mid-market", owner: "Rahul Mehta", contact: { name: "Kavitha Raman", email: "finance@deltaeng.example" }, lifetimeValue: 14_20_000, last12Months: 6_10_000, lastOrder: "9 Jul 2026", paymentTerms: "Net 30" },
  { id: "c_metro", name: "Metro Components", city: "Pune", segment: "SME", owner: "Neha Kulkarni", contact: { name: "Amit Joshi", email: "amit@metrocomponents.example" }, lifetimeValue: 7_80_000, last12Months: 3_20_000, lastOrder: "13 Jul 2026", paymentTerms: "Net 30" },
  { id: "c_kiran", name: "Kiran Fabricators", city: "Aurangabad", segment: "SME", owner: "Neha Kulkarni", contact: { name: "Kiran Patil", email: "kiran@kiranfab.example" }, lifetimeValue: 4_90_000, last12Months: 2_10_000, lastOrder: "22 Jul 2026", paymentTerms: "Net 30" },
  { id: "c_sharma", name: "Sharma Tools", city: "Ludhiana", segment: "SME", owner: "Vikram Iyer", contact: { name: "Harpreet Sharma", email: "accounts@sharmatools.example" }, lifetimeValue: 3_60_000, last12Months: 1_40_000, lastOrder: "27 Jul 2026", paymentTerms: "Net 30" },
  { id: "c_orion", name: "Orion Pumps", city: "Coimbatore", segment: "SME", owner: "Rahul Mehta", contact: { name: "Deepa Krishnan", email: "deepa@orionpumps.example" }, lifetimeValue: 5_20_000, last12Months: 1_90_000, lastOrder: "29 Jul 2026", paymentTerms: "Net 30" },
  { id: "c_apex", name: "Apex Industries", city: "Vadodara", segment: "Mid-market", owner: "Vikram Iyer", contact: { name: "Nikhil Shah", email: "nikhil@apexind.example" }, lifetimeValue: 31_20_000, last12Months: 0, lastOrder: "28 Jan 2026", paymentTerms: "Net 45" },
  { id: "c_zenith", name: "Zenith Engineering", city: "Bengaluru", segment: "Mid-market", owner: "Rahul Mehta", contact: { name: "Arjun Rao", email: "arjun@zenitheng.example" }, lifetimeValue: 19_60_000, last12Months: 0, lastOrder: "21 Feb 2026", paymentTerms: "Net 30" },
  { id: "c_metroctl", name: "Metro Controls", city: "Ahmedabad", segment: "SME", owner: "Neha Kulkarni", contact: { name: "Farhan Qureshi", email: "farhan@metrocontrols.example" }, lifetimeValue: 12_10_000, last12Months: 0, lastOrder: "30 Oct 2025", paymentTerms: "Net 30" },
  { id: "c_nova", name: "Nova Autoparts", city: "Gurugram", segment: "Enterprise", owner: "Rahul Mehta", contact: { name: "Ishaan Verma", email: "ishaan@novaauto.example" }, lifetimeValue: 28_90_000, last12Months: 11_60_000, lastOrder: "3 Sep 2026", paymentTerms: "Net 45" },
  { id: "c_sunrise", name: "Sunrise Polymers", city: "Daman", segment: "Mid-market", owner: "Vikram Iyer", contact: { name: "Meera Desai", email: "meera@sunrisepoly.example" }, lifetimeValue: 16_30_000, last12Months: 7_20_000, lastOrder: "18 Aug 2026", paymentTerms: "Net 30" },
  { id: "c_shree", name: "Shree Castings", city: "Kolhapur", segment: "SME", owner: "Rahul Mehta", contact: { name: "Sanjay Jadhav", email: "sanjay@shreecastings.example" }, lifetimeValue: 9_40_000, last12Months: 4_30_000, lastOrder: "2 Aug 2026", paymentTerms: "Net 30" },
  { id: "c_lakshmi", name: "Lakshmi Textile Machinery", city: "Tiruppur", segment: "Mid-market", owner: "Neha Kulkarni", contact: { name: "Lakshmi Narayanan", email: "ln@lakshmitm.example" }, lifetimeValue: 13_70_000, last12Months: 5_60_000, lastOrder: "25 Aug 2026", paymentTerms: "Net 45" },
];

export function getCustomer(id: string) {
  return customers.find((c) => c.id === id);
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  issued: string;
  due: string;
  daysOverdue: number;
  lastReminder?: string;
}

/** Six overdue invoices, ₹8,40,000 in total. */
export const overdueInvoices: Invoice[] = [
  { id: "INV-318", customerId: "c_abc", amount: 4_82_000, issued: "24 Jun 2026", due: "24 Jul 2026", daysOverdue: 67, lastReminder: "31 Aug 2026" },
  { id: "INV-327", customerId: "c_delta", amount: 1_64_000, issued: "9 Jul 2026", due: "9 Aug 2026", daysOverdue: 51, lastReminder: "2 Sep 2026" },
  { id: "INV-331", customerId: "c_metro", amount: 98_500, issued: "13 Jul 2026", due: "13 Aug 2026", daysOverdue: 47 },
  { id: "INV-342", customerId: "c_kiran", amount: 42_000, issued: "22 Jul 2026", due: "22 Aug 2026", daysOverdue: 38, lastReminder: "Today, 11:35" },
  { id: "INV-349", customerId: "c_sharma", amount: 31_500, issued: "27 Jul 2026", due: "27 Aug 2026", daysOverdue: 33, lastReminder: "Today, 11:35" },
  { id: "INV-356", customerId: "c_orion", amount: 22_000, issued: "29 Jul 2026", due: "29 Aug 2026", daysOverdue: 31, lastReminder: "Today, 11:35" },
];

export const overdueTotal = overdueInvoices.reduce((s, i) => s + i.amount, 0);

export interface Deal {
  id: string;
  name: string;
  customerId: string;
  value: number;
  stage: string;
  owner: string;
  daysInactive: number;
  lastActivity: string;
}

/** Four stalled opportunities worth ₹14.2L (part of an ₹42.8L open pipeline). */
export const stalledDeals: Deal[] = [
  { id: "D-1184", name: "CNC retrofit — Line 3", customerId: "c_nova", value: 4_60_000, stage: "Proposal", owner: "Rahul Mehta", daysInactive: 14, lastActivity: "Proposal sent" },
  { id: "D-1191", name: "Annual spares contract", customerId: "c_sunrise", value: 3_80_000, stage: "Negotiation", owner: "Vikram Iyer", daysInactive: 12, lastActivity: "Pricing call" },
  { id: "D-1203", name: "Model-X gearbox line", customerId: "c_shree", value: 3_40_000, stage: "Qualified", owner: "Rahul Mehta", daysInactive: 11, lastActivity: "Site visit" },
  { id: "D-1176", name: "Hydraulic upgrade", customerId: "c_lakshmi", value: 2_40_000, stage: "Proposal", owner: "Neha Kulkarni", daysInactive: 16, lastActivity: "Email reply" },
];

export interface InventoryItem {
  sku: string;
  name: string;
  onHand: number;
  minimum: number;
  dailyUsage: number;
  unitCost: number;
  location: string;
}

export const lowStock: InventoryItem[] = [
  { sku: "MX-GB-220", name: "Model-X gearbox assembly", onHand: 38, minimum: 20, dailyUsage: 3.1, unitCost: 5_100, location: "Chakan WH-1" },
  { sku: "HS-40", name: "Hydraulic seal kit 40mm", onHand: 62, minimum: 80, dailyUsage: 4.5, unitCost: 640, location: "Chakan WH-1" },
  { sku: "BH-12", name: "Bearing housing BH-12", onHand: 24, minimum: 30, dailyUsage: 1.8, unitCost: 1_850, location: "Bhosari WH-2" },
  { sku: "CP-7", name: "Control panel CP-7", onHand: 11, minimum: 8, dailyUsage: 0.6, unitCost: 22_400, location: "Chakan WH-1" },
];

export function daysToMinimum(item: InventoryItem) {
  return Math.max(0, Math.round((item.onHand - item.minimum) / item.dailyUsage));
}

export interface ReactivationCandidate {
  customerId: string;
  previousPurchases: number;
  monthsSinceOrder: number;
  lastProduct: string;
}

export const reactivationCandidates: ReactivationCandidate[] = [
  { customerId: "c_apex", previousPurchases: 18_40_000, monthsSinceOrder: 8, lastProduct: "Model-X gearbox assemblies" },
  { customerId: "c_zenith", previousPurchases: 11_20_000, monthsSinceOrder: 7, lastProduct: "CP-7 control panels" },
  { customerId: "c_metroctl", previousPurchases: 8_70_000, monthsSinceOrder: 11, lastProduct: "Hydraulic seal kits" },
];

/** The Tata Engineering quotation awaiting discount approval. */
export const tataQuote = {
  id: "QT-2042",
  customerId: "c_tata",
  lines: [
    { item: "Model-X gearbox assembly", sku: "MX-GB-220", qty: 96, unitPrice: 5_900 },
    { item: "Control panel CP-7", sku: "CP-7", qty: 4, unitPrice: 25_100 },
    { item: "Hydraulic seal kit 40mm", sku: "HS-40", qty: 120, unitPrice: 800 },
    { item: "Commissioning & site support", sku: "SVC-COM", qty: 1, unitPrice: 35_494 },
  ],
  listValue: 7_98_294,
  discountPct: 6.2,
  discount: 49_494,
  net: 7_48_800,
  gst: 1_34_784,
  total: 8_83_584,
  autoApprovalLimitPct: 5,
};

export const metrics = {
  revenueThisMonth: 38_40_000,
  revenueYoY: 12.4,
  revenueVsLastMonth: 8.2,
  outstanding: overdueTotal,
  overdueInvoices: overdueInvoices.length,
  oldestOverdueDays: Math.max(...overdueInvoices.map((i) => i.daysOverdue)),
  openPipeline: 42_80_000,
  openOpportunities: 18,
  stalledValue: stalledDeals.reduce((s, d) => s + d.value, 0),
  customers: 184,
  inventorySkus: 428,
  toolExecutions: 12_842,
  hoursSaved: 384,
};
