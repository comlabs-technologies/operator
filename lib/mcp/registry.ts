import { toolDefinitions } from "@/lib/mock/tools";
import { genericHandler, handlers } from "./connectors";
import type { ToolDefinition, ToolHandler } from "./types";

/**
 * Central tool registry. Every tool Operator can call is registered once,
 * with its connection, permission scope, risk and approval policy. Agents
 * and workflows reference tools by id; they never talk to connectors directly.
 */

interface RegisteredTool {
  definition: ToolDefinition;
  handler: ToolHandler;
}

const registry = new Map<string, RegisteredTool>();

export function registerTool(definition: ToolDefinition, handler: ToolHandler = genericHandler) {
  if (registry.has(definition.id)) {
    throw new Error(`Tool ${definition.id} is already registered`);
  }
  registry.set(definition.id, { definition, handler });
}

export function getTool(id: string) {
  return registry.get(id);
}

export function listTools(): ToolDefinition[] {
  return [...registry.values()].map((t) => t.definition);
}

export function toolsForConnection(connection: string) {
  return listTools().filter((t) => t.connection === connection);
}

for (const definition of toolDefinitions) {
  registerTool(definition, handlers[definition.id]);
}
