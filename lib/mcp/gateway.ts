import { agentPermissionPolicy, requiresApproval } from "@/lib/runtime/permissions";
import { getConnection } from "@/lib/mock/connections";
import { nowISO, sleep } from "@/lib/utils";
import { getTool } from "./registry";
import type { AuditEvent, ExecutionContext, ToolExecution } from "./types";

/**
 * The gateway is the only path from Operator to a connected system.
 *
 *   registry lookup → permission check → approval check → connector → audit
 *
 * Every attempt is written to the audit sink, including blocked calls and
 * calls held for approval. Credentials live with the connector and are never
 * part of the input, the output or the audit record.
 */

let seq = 0;
function executionId() {
  seq += 1;
  const rand = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `exe_${Date.now().toString(16).slice(-6)}${rand}${seq}`;
}

export async function executeTool<T = unknown>(
  toolId: string,
  input: Record<string, unknown>,
  ctx: ExecutionContext,
): Promise<ToolExecution<T>> {
  const registered = getTool(toolId);
  if (!registered) throw new Error(`Unknown tool: ${toolId}`);

  const { definition: tool, handler } = registered;
  const id = executionId();
  const started = performance.now();
  const connection = getConnection(tool.connection);

  const audit = (partial: Pick<AuditEvent, "result" | "summary" | "resource"> & Partial<AuditEvent>) =>
    ctx.audit({
      id: `evt_${id}`,
      executionId: id,
      timestamp: nowISO(),
      actor: ctx.actor,
      action: tool.name,
      toolId: tool.id,
      connection: tool.connection,
      durationMs: Math.round(performance.now() - started),
      permission: tool.permission,
      input,
      approval: ctx.approval
        ? { status: "approved", approvalId: ctx.approval.approvalId, decidedBy: ctx.approval.decidedBy }
        : { status: "not_required" },
      ...partial,
    });

  ctx.onProgress?.(`Checking ${connection?.name ?? tool.connection}`);

  // 1. Permission
  const permission = agentPermissionPolicy.check(tool, ctx.agentId);
  await sleep(120);
  if (!permission.allowed) {
    audit({ result: "blocked", permissionDecision: "denied", reason: permission.reason, summary: `${tool.name} blocked by policy`, resource: String(input.invoice_id ?? input.company ?? tool.name), output: { error: "permission_denied" } });
    return { executionId: id, toolId, result: "blocked", durationMs: Math.round(performance.now() - started), summary: "Blocked by policy", reason: permission.reason };
  }

  // 2. Approval
  if (!ctx.approval && requiresApproval(tool, permission.access, input)) {
    audit({ result: "pending_approval", permissionDecision: "granted", approval: { status: "pending" }, reason: tool.approval.description, summary: `${tool.name} held for approval`, resource: String(input.company ?? input.customer_id ?? tool.name) });
    return { executionId: id, toolId, result: "pending_approval", durationMs: Math.round(performance.now() - started), summary: "Held for approval", reason: tool.approval.description };
  }

  // 3. Connector
  const [min, max] = tool.latency;
  await sleep(min + Math.random() * (max - min));
  try {
    const out = handler(input);
    audit({ result: "success", permissionDecision: "granted", summary: out.summary, resource: out.resource, output: out.data });
    ctx.onProgress?.(out.summary);
    return { executionId: id, toolId, result: "success", durationMs: Math.round(performance.now() - started), data: out.data as T, summary: out.summary };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Connector error";
    audit({ result: "failed", permissionDecision: "granted", reason, summary: `${tool.name} failed`, resource: tool.name });
    return { executionId: id, toolId, result: "failed", durationMs: Math.round(performance.now() - started), summary: "Failed", reason };
  }
}
