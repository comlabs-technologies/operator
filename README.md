# Operator

**Connect your business systems to AI, safely.**

Operator is a demo of an internal AI operations layer: business systems are exposed as permissioned tools, agents and workflows call those tools through a single gateway, sensitive actions wait for a person's approval, and every attempt lands in an audit log. People work in Operator directly. They don't need a ChatGPT or Claude UI.

```
User → Operator UI → Agent runtime → Permission layer → Tool registry / gateway → Connected systems
                                                     ↘ Approvals ↗          ↘ Audit log
```

The demo workspace is **Acme Industrial**, a fictional machinery manufacturer with HubSpot CRM, a custom ERP, PostgreSQL, Gmail and Google Drive connected. All data and connectors are mocked. The execution pipeline itself is real code, and every button runs through it.

## Running

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

`/welcome` is a minimal entry screen. State is in-memory per browser session. Use **Reset demo data** in the user menu to start over.

## Demo flows

1. **Receivables → approval → send.** Overview → *Review payments* → select invoices → *Prepare reminders*. The Finance Assistant drafts three emails (drafting is allowed) and you *Request approval* (sending is always held). Approve it in **Approvals**. The emails are sent, the CRM timeline is updated, and the events appear in **Activity**. The execution count on Overview and Analytics goes up.
2. **Reactivation outreach.** Ask: *"Find customers who spent more than ₹5L last year but have not ordered in six months."* → *Prepare reactivation outreach* → *Request approval*.

Other things to try: ⌘K command palette, `/` search, *Run workflow*, the tool drawer's *Run test*, blocked `issue_refund` in Activity, editing agent instructions, and adding a connection.

## Architecture

| Path | Role |
|---|---|
| `lib/mcp/types.ts` | Contracts: `ToolDefinition`, `ApprovalPolicy`, `ExecutionContext`, `AuditEvent` |
| `lib/mcp/registry.ts` | Central `registerTool` / `getTool`; all 44 tools are registered here |
| `lib/mcp/connectors.ts` | Mock connectors (stand-ins for HubSpot, ERP API, read-only Postgres, Gmail, Drive) |
| `lib/mcp/gateway.ts` | `executeTool`: registry → permission check → approval check → connector → audit |
| `lib/runtime/permissions.ts` | `PermissionPolicy` (per-agent allowed / approval / blocked) and approval evaluation |
| `lib/runtime/router.ts` | `ModelProvider` interface (`selectTools`, `generate`) and a deterministic `MockProvider`; provider-agnostic by design |
| `lib/runtime/execute.ts` | Agent runtime: plan → execute calls (with chained inputs) → compose structured response |
| `lib/runtime/workflows.ts` | Runs workflow steps through the same gateway; approval steps raise approval requests |
| `lib/store.ts` | Zustand store for approvals, the audit log, connections and workflow state, so the flows stay connected across pages |
| `lib/mock/*` | Typed mock data: company, connections, tools, agents, approvals, workflows, activity, analytics |

Model output is structured (tables, figures, suggested actions). The UI shows execution metadata ("Checking Custom ERP · Retrieved 3 invoices"), never model reasoning.

## Data notes

Headline figures are derived from the underlying records, so they agree everywhere: ₹8.4L overdue = the six invoices, ₹14.2L stalled = the four deals, 12,842 executions = the sum of per-tool counts. To keep this consistent, a few figures differ from the original brief:

- The invoices over 45 days total **₹7,44,500** (ABC ₹4,82,000 · Delta ₹1,64,000 · Metro ₹98,500), because they must fit inside the ₹8.4L overdue total.
- The reactivation list uses **Apex Industries** instead of ABC Industries, since ABC has a recent overdue invoice.
- The Tata Engineering quotation awaiting approval is ₹8,83,584 everywhere, including in the brief.
- `search_customer` shows 3,482 executions on both Tools and Analytics.

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn-style components on Radix primitives, cmdk, Framer Motion, Recharts, Zustand, Lucide.
