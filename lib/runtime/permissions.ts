import { getAgent, type ToolAccess } from "@/lib/mock/agents";
import type { ToolDefinition } from "@/lib/mcp/types";

/**
 * Permission layer. Two independent checks run before any connector call:
 *   1. PermissionPolicy — may this principal call this tool at all?
 *   2. ApprovalPolicy  — must a human confirm this specific call first?
 */

export type PermissionDecision =
  | { allowed: true; access: ToolAccess }
  | { allowed: false; reason: string };

export interface PermissionPolicy {
  check(tool: ToolDefinition, agentId?: string): PermissionDecision;
}

export const agentPermissionPolicy: PermissionPolicy = {
  check(tool, agentId) {
    if (tool.status === "disabled") {
      return { allowed: false, reason: `${tool.name} is disabled for this workspace` };
    }
    // Direct calls by people are governed by their role; in the demo the
    // signed-in owner may call anything that is not disabled or restricted.
    if (!agentId) {
      return tool.status === "restricted"
        ? { allowed: false, reason: `${tool.permission} is restricted to the finance team` }
        : { allowed: true, access: tool.approval.mode === "never" ? "allowed" : "approval" };
    }
    const agent = getAgent(agentId);
    const access = agent?.tools[tool.id];
    if (!agent || !access) {
      return { allowed: false, reason: `${tool.name} is not assigned to ${agent?.name ?? agentId}` };
    }
    if (access === "blocked") {
      return { allowed: false, reason: `${tool.permission} is not granted to ${agent.name}` };
    }
    if (agent.readOnly && tool.type === "write") {
      return { allowed: false, reason: `${agent.name} is read-only` };
    }
    return { allowed: true, access };
  },
};

/** Does this particular call need a human decision before it runs? */
export function requiresApproval(tool: ToolDefinition, access: ToolAccess, input: Record<string, unknown>) {
  if (tool.approval.mode === "always") return true;
  if (tool.approval.mode === "conditional") return tool.approval.when?.(input) ?? true;
  return access === "approval";
}
