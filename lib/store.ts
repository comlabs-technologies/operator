"use client";

import { create } from "zustand";
import { executeTool } from "@/lib/mcp/gateway";
import type { AuditEvent } from "@/lib/mcp/types";
import { seedActivity } from "@/lib/mock/activity";
import { seedApprovals, type Approval } from "@/lib/mock/approvals";
import { metrics } from "@/lib/mock/company";
import { connections as seedConnections, type Connection } from "@/lib/mock/connections";
import { agents } from "@/lib/mock/agents";
import { workflows } from "@/lib/mock/workflows";
import { agentActor, type RuntimeHooks } from "@/lib/runtime/execute";
import { currentUser } from "@/lib/mock/company";
import { minutesAgo, nowISO } from "@/lib/utils";

export interface Notification {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
  read: boolean;
}

type Decision = "approve" | "reject" | "changes";

interface OperatorState {
  approvals: Approval[];
  activity: AuditEvent[];
  sessionExecutions: number;
  connections: Connection[];
  instructions: Record<string, { text: string; editedAt?: string }>;
  workflowStatus: Record<string, "active" | "paused">;
  workflowRuns: Record<string, number>;
  notifications: Notification[];
  processing: Record<string, boolean>;

  recordEvent: (event: AuditEvent) => void;
  hooks: (onProgress?: (message: string) => void) => RuntimeHooks;
  requestApproval: (input: Omit<Approval, "id" | "createdAt" | "status">) => Approval;
  decideApproval: (id: string, decision: Decision, note?: string) => Promise<void>;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, patch: Partial<Connection>) => void;
  saveInstructions: (agentId: string, text: string) => void;
  toggleWorkflow: (id: string) => void;
  recordWorkflowRun: (id: string) => void;
  notify: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  reset: () => void;
}

const seedNotifications: Notification[] = [
  { id: "n1", title: "Quotation needs approval", detail: "Tata Engineering · QT-2042 · ₹8,83,584", href: "/approvals?id=APR-1045", createdAt: minutesAgo(2), read: false },
  { id: "n2", title: "Payment reminders sent", detail: "Anita approved 3 reminders from accounts@", href: "/activity", createdAt: minutesAgo(8), read: false },
  { id: "n3", title: "Stock below minimum in 6 days", detail: "Model-X gearbox assembly · requisition pending", href: "/approvals?id=APR-1044", createdAt: minutesAgo(51), read: true },
  { id: "n4", title: "Today's brief is ready", detail: "Daily Management Brief · 8:30 AM", href: "/", createdAt: minutesAgo(193), read: true },
];

const initial = () => ({
  approvals: seedApprovals,
  activity: seedActivity,
  sessionExecutions: 0,
  connections: seedConnections,
  instructions: Object.fromEntries(agents.map((a) => [a.id, { text: a.instructions }])),
  workflowStatus: Object.fromEntries(workflows.map((w) => [w.id, w.status])),
  workflowRuns: {},
  notifications: seedNotifications,
  processing: {},
});

let approvalSeq = 1046;
let eventSeq = 0;

export const useOperator = create<OperatorState>()((set, get) => ({
  ...initial(),

  recordEvent: (event) =>
    set((s) => ({
      activity: [event, ...s.activity],
      sessionExecutions: s.sessionExecutions + (event.toolId ? 1 : 0),
    })),

  hooks: (onProgress) => ({ user: currentUser.name, audit: get().recordEvent, onProgress }),

  requestApproval: (input) => {
    const approval: Approval = {
      ...input,
      id: `APR-${approvalSeq++}`,
      createdAt: nowISO(),
      status: "pending",
    };
    set((s) => ({
      // A newer request covering the same invoices or customers replaces older pending ones.
      approvals: [
        approval,
        ...s.approvals.map((a) =>
          a.status === "pending" && a.kind === approval.kind && a.covers?.some((c) => approval.covers?.includes(c))
            ? { ...a, status: "superseded" as const, note: `Replaced by ${approval.id}`, decidedAt: approval.createdAt }
            : a,
        ),
      ],
    }));
    get().notify({ title: `${approval.title} needs approval`, detail: `${approval.subject} · requested by ${approval.requestedBy}`, href: `/approvals?id=${approval.id}` });
    return approval;
  },

  decideApproval: async (id, decision, note) => {
    const approval = get().approvals.find((a) => a.id === id);
    if (!approval || approval.status !== "pending") return;
    const { recordEvent } = get();
    const decidedAt = () => nowISO();
    const userEvent = (action: string, summary: string): AuditEvent => ({
      id: `evt_decision_${++eventSeq}`,
      executionId: `exe_dec${Date.now().toString(16).slice(-7)}${eventSeq}`,
      timestamp: decidedAt(),
      actor: { type: "user", name: currentUser.name },
      action,
      resource: approval.subject,
      result: "success",
      durationMs: 120 + Math.round(Math.random() * 80),
      permission: "approvals.decide",
      permissionDecision: "granted",
      approval: { status: decision === "approve" ? "approved" : "rejected", approvalId: id, decidedBy: currentUser.name },
      input: { approval_id: id, ...(note ? { note } : {}) },
      output: { status: decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "changes_requested" },
      summary,
    });

    if (decision === "reject" || decision === "changes") {
      recordEvent(userEvent(decision === "reject" ? "reject_request" : "request_changes", `${decision === "reject" ? "Rejected" : "Requested changes to"} ${approval.title.toLowerCase()} · ${approval.subject}`));
      set((s) => ({
        approvals: s.approvals.map((a) =>
          a.id === id ? { ...a, status: decision === "reject" ? "rejected" : "changes_requested", decidedBy: currentUser.name, decidedAt: decidedAt(), note } : a,
        ),
      }));
      return;
    }

    set((s) => ({ processing: { ...s.processing, [id]: true } }));
    recordEvent(userEvent("approve_request", `Approved ${approval.title.toLowerCase()} · ${approval.subject}`));

    const ctx = {
      actor: agentActor(approval.agentId, approval.requestedBy.includes("Assistant") ? undefined : approval.requestedBy),
      agentId: approval.agentId,
      approval: { approvalId: id, decidedBy: currentUser.name },
      audit: recordEvent,
    };
    for (const call of approval.action.calls) {
      await executeTool(approval.action.toolId, call, ctx);
    }

    // Follow-through: keep the CRM in step with what was sent.
    if (approval.kind === "payment_reminder") {
      for (const call of approval.action.calls) {
        await executeTool("hubspot.log_activity", { company: call.company, type: "email", body: call.subject }, {
          actor: { type: "workflow", name: "Overdue Invoice Follow-up", workflowId: "overdue-invoice-follow-up" },
          audit: recordEvent,
        });
      }
    }
    if (approval.kind === "outreach") {
      for (const call of approval.action.calls) {
        await executeTool("hubspot.create_task", { deal_id: String(call.ref), owner: String(call.owner ?? "Account owner"), title: `Follow up on outreach to ${call.company}`, due: "In 5 days" }, { ...ctx, approval: undefined });
      }
    }

    set((s) => ({
      processing: { ...s.processing, [id]: false },
      approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: "approved", decidedBy: currentUser.name, decidedAt: decidedAt(), note } : a)),
    }));
  },

  addConnection: (connection) => set((s) => ({ connections: [...s.connections, connection] })),
  updateConnection: (id, patch) => set((s) => ({ connections: s.connections.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  saveInstructions: (agentId, text) =>
    set((s) => ({ instructions: { ...s.instructions, [agentId]: { text, editedAt: nowISO() } } })),

  toggleWorkflow: (id) =>
    set((s) => ({ workflowStatus: { ...s.workflowStatus, [id]: s.workflowStatus[id] === "active" ? "paused" : "active" } })),

  recordWorkflowRun: (id) => set((s) => ({ workflowRuns: { ...s.workflowRuns, [id]: (s.workflowRuns[id] ?? 0) + 1 } })),

  notify: (n) =>
    set((s) => ({
      notifications: [{ ...n, id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: nowISO(), read: false }, ...s.notifications],
    })),

  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  reset: () => set(initial()),
}));

/** Selectors */
export const usePendingCount = () => useOperator((s) => s.approvals.filter((a) => a.status === "pending").length);
export const useToolExecutions = () => useOperator((s) => metrics.toolExecutions + s.sessionExecutions);
