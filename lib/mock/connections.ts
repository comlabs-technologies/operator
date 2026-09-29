import type { ConnectionId } from "@/lib/mcp/types";

export type ConnectionKind =
  | "hubspot"
  | "erp"
  | "postgres"
  | "gmail"
  | "drive"
  | "rest"
  | "openapi"
  | "mysql"
  | "salesforce"
  | "shopify"
  | "custom";

export interface Connection {
  id: ConnectionId;
  name: string;
  shortName: string;
  kind: ConnectionKind;
  category: string;
  description: string;
  status: "connected" | "syncing" | "error";
  auth: string;
  access: "Read & write" | "Read-only";
  toolCount: number;
  lastSynced: string;
  lastActivity: string;
  syncSchedule: string;
  owner: string;
  endpoint: string;
  objects: string[];
  scopes: string[];
}

export const connections: Connection[] = [
  {
    id: "hubspot",
    name: "HubSpot CRM",
    shortName: "HubSpot",
    kind: "hubspot",
    category: "CRM",
    description: "Contacts, companies, deals and activity timeline for the sales team.",
    status: "connected",
    auth: "OAuth 2.0",
    access: "Read & write",
    toolCount: 8,
    lastSynced: "2 min ago",
    lastActivity: "2 minutes ago",
    syncSchedule: "Every 5 minutes",
    owner: "Priya Nair",
    endpoint: "api.hubapi.com",
    objects: ["Companies", "Contacts", "Deals", "Tasks", "Engagements"],
    scopes: ["crm.objects.companies.read", "crm.objects.deals.read", "crm.objects.deals.write", "crm.objects.contacts.read", "timeline.write"],
  },
  {
    id: "erp",
    name: "Custom ERP",
    shortName: "ERP",
    kind: "erp",
    category: "ERP",
    description: "Acme's in-house ERP — orders, pricing, invoicing, inventory and purchasing.",
    status: "connected",
    auth: "API key",
    access: "Read & write",
    toolCount: 14,
    lastSynced: "just now",
    lastActivity: "3 minutes ago",
    syncSchedule: "Real-time (webhooks)",
    owner: "Anita Rao",
    endpoint: "erp.acmeindustrial.internal/api/v2",
    objects: ["Customers", "Orders", "Quotations", "Invoices", "Inventory", "Price lists", "Purchase requisitions"],
    scopes: ["customers:read", "orders:read", "orders:write", "quotes:write", "invoices:read", "inventory:read", "purchasing:write", "refunds:write"],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    shortName: "PostgreSQL",
    kind: "postgres",
    category: "Database",
    description: "Analytics warehouse replica. Operator connects with a read-only role.",
    status: "connected",
    auth: "Read-only role",
    access: "Read-only",
    toolCount: 11,
    lastSynced: "6 min ago",
    lastActivity: "11 minutes ago",
    syncSchedule: "Replica · 15 min lag",
    owner: "Anita Rao",
    endpoint: "warehouse-replica.acme.internal:5432/analytics",
    objects: ["sales_daily", "receivables_aging", "pipeline_snapshot", "inventory_levels", "customer_ltv"],
    scopes: ["SELECT on analytics.*"],
  },
  {
    id: "gmail",
    name: "Gmail",
    shortName: "Gmail",
    kind: "gmail",
    category: "Email",
    description: "Shared sales@ and accounts@ mailboxes for drafting and sending customer email.",
    status: "connected",
    auth: "OAuth 2.0",
    access: "Read & write",
    toolCount: 6,
    lastSynced: "4 min ago",
    lastActivity: "8 minutes ago",
    syncSchedule: "Push notifications",
    owner: "Pawan",
    endpoint: "gmail.googleapis.com",
    objects: ["Drafts", "Threads", "Labels"],
    scopes: ["gmail.compose", "gmail.send", "gmail.readonly"],
  },
  {
    id: "drive",
    name: "Google Drive",
    shortName: "Drive",
    kind: "drive",
    category: "Documents",
    description: "Rate contracts, product datasheets and customer purchase orders.",
    status: "connected",
    auth: "OAuth 2.0",
    access: "Read & write",
    toolCount: 5,
    lastSynced: "12 min ago",
    lastActivity: "45 minutes ago",
    syncSchedule: "Hourly index",
    owner: "Pawan",
    endpoint: "drive.googleapis.com",
    objects: ["Sales / Rate contracts", "Products / Datasheets", "Customers / POs"],
    scopes: ["drive.readonly", "drive.file"],
  },
];

export function getConnection(id: string) {
  return connections.find((c) => c.id === id);
}

export interface ConnectorOption {
  kind: ConnectionKind;
  name: string;
  description: string;
  group: "Protocols" | "Databases" | "Applications";
  auth: string;
}

export const connectorCatalog: ConnectorOption[] = [
  { kind: "rest", name: "REST API", description: "Any HTTPS JSON API", group: "Protocols", auth: "API key or OAuth" },
  { kind: "openapi", name: "OpenAPI", description: "Generate tools from a spec", group: "Protocols", auth: "From spec" },
  { kind: "custom", name: "Custom connector", description: "Build with the Operator SDK", group: "Protocols", auth: "Custom" },
  { kind: "postgres", name: "PostgreSQL", description: "Read-only role recommended", group: "Databases", auth: "Database role" },
  { kind: "mysql", name: "MySQL", description: "Read-only role recommended", group: "Databases", auth: "Database role" },
  { kind: "hubspot", name: "HubSpot", description: "CRM objects and timeline", group: "Applications", auth: "OAuth 2.0" },
  { kind: "salesforce", name: "Salesforce", description: "Accounts, opportunities, cases", group: "Applications", auth: "OAuth 2.0" },
  { kind: "shopify", name: "Shopify", description: "Orders, products, customers", group: "Applications", auth: "OAuth 2.0" },
  { kind: "gmail", name: "Gmail", description: "Draft and send from shared inboxes", group: "Applications", auth: "OAuth 2.0" },
  { kind: "drive", name: "Google Drive", description: "Search and read documents", group: "Applications", auth: "OAuth 2.0" },
];
