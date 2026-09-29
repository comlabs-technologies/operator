import { executeTool } from "@/lib/mcp/gateway";
import { listTools } from "@/lib/mcp/registry";
import type { Actor, AuditEvent, ToolExecution } from "@/lib/mcp/types";
import { getAgent } from "@/lib/mock/agents";
import { modelProvider, type AskResponse, type PlannedCall, type ToolPlan } from "./router";

/**
 * Agent runtime: request → model provider (plan) → gateway (execute each call
 * with permission and approval checks) → model provider (compose response).
 */

export interface RuntimeHooks {
  /** Person on whose behalf the agent acts. */
  user: string;
  audit: (event: AuditEvent) => void;
  onProgress?: (message: string) => void;
}

export interface AskRun {
  plan: ToolPlan;
  agentName: string;
  executions: ToolExecution[];
  response: AskResponse;
}

export function agentActor(agentId: string, user?: string): Actor {
  return { type: "agent", name: getAgent(agentId)?.name ?? agentId, agentId, onBehalfOf: user };
}

export async function runCalls(calls: PlannedCall[], agentId: string, hooks: RuntimeHooks) {
  const executions: ToolExecution[] = [];
  for (const call of calls) {
    const input = typeof call.input === "function" ? call.input(executions) : call.input;
    const execution = await executeTool(call.toolId, input, {
      actor: agentActor(agentId, hooks.user),
      agentId,
      audit: hooks.audit,
      onProgress: hooks.onProgress,
    });
    executions.push(execution);
    if (execution.result === "blocked" || execution.result === "failed") break;
  }
  return executions;
}

export async function ask(prompt: string, hooks: RuntimeHooks): Promise<AskRun> {
  const plan = await modelProvider.selectTools(prompt, listTools());
  const agentName = getAgent(plan.agentId)?.name ?? plan.agentId;
  const executions = await runCalls(plan.calls, plan.agentId, hooks);
  if (plan.calls.length) hooks.onProgress?.("Prepared summary");
  const response = await modelProvider.generate(plan, executions);
  return { plan, agentName, executions, response };
}
