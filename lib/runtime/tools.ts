import { agents, getAgent, type ToolAccess } from "@/lib/mock/agents";
import { getTool } from "@/lib/mcp/registry";
import type { ToolDefinition } from "@/lib/mcp/types";

export type AgentTool = ToolDefinition & { access: ToolAccess };

/** The agent-scoped view of the registry: what an agent can see and at what access level. */
export function toolsForAgent(agentId: string): AgentTool[] {
  const agent = getAgent(agentId);
  if (!agent) return [];
  return Object.entries(agent.tools).flatMap(([id, access]) => {
    const tool = getTool(id)?.definition;
    return tool ? [{ ...tool, access }] : [];
  });
}

/** Agents that have a tool assigned, with their access level. */
export function agentsForTool(toolId: string) {
  return agents
    .filter((a) => a.tools[toolId])
    .map((a) => ({ id: a.id, name: a.name, access: a.tools[toolId] }));
}
