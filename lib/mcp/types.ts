/**
 * Core contracts for the Operator tool gateway.
 *
 * Every business action flows through the same pipeline:
 *   UI → agent runtime → tool registry → permission check → approval check
 *      → connector → result → audit event
 *
 * Connectors are mocked in this workspace, but the contracts are the ones a
 * production MCP gateway would expose.
 */

export type ConnectionId = "hubspot" | "erp" | "postgres" | "gmail" | "drive" | (string & {});

export type ToolType = "read" | "write";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ToolStatus = "active" | "approval_required" | "restricted" | "disabled";

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: { type: string };
}

export interface ToolInputSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface ApprovalPolicy {
  /** never: executes directly. always: every call is held. conditional: `when` decides. */
  mode: "never" | "always" | "conditional";
  description: string;
  when?: (input: Record<string, unknown>) => boolean;
}

/** Static definition of a tool as registered with the gateway. */
export interface ToolDefinition {
  /** Globally unique id: `${connection}.${name}` */
  id: string;
  name: string;
  connection: ConnectionId;
  description: string;
  type: ToolType;
  permission: string;
  risk: RiskLevel;
  status: ToolStatus;
  approval: ApprovalPolicy;
  inputSchema: ToolInputSchema;
  /** Executions this month before the current session. */
  executions: number;
  /** Typical connector latency, used by the simulator. */
  latency: [min: number, max: number];
}

export interface ToolHandlerResult<T = unknown> {
  data: T;
  /** Human readable, e.g. "Retrieved 6 invoices". Shown as execution metadata. */
  summary: string;
  /** Resource label written to the audit log, e.g. "Tata Engineering". */
  resource: string;
}

export type ToolHandler = (input: Record<string, unknown>) => ToolHandlerResult;

export type Actor =
  | { type: "user"; name: string }
  | { type: "agent"; name: string; agentId: string; onBehalfOf?: string }
  | { type: "workflow"; name: string; workflowId: string; agentId?: string };

export type ExecutionResult = "success" | "blocked" | "pending_approval" | "failed";

export interface ApprovalRef {
  status: "not_required" | "pending" | "approved" | "rejected";
  approvalId?: string;
  decidedBy?: string;
}

/** A single immutable row in the audit log. */
export interface AuditEvent {
  id: string;
  executionId: string;
  timestamp: string;
  actor: Actor;
  action: string;
  toolId?: string;
  connection?: ConnectionId;
  resource: string;
  result: ExecutionResult;
  durationMs: number;
  permission?: string;
  permissionDecision?: "granted" | "denied";
  approval: ApprovalRef;
  input?: Record<string, unknown>;
  output?: unknown;
  /** One-line human summary used by feeds. */
  summary: string;
  reason?: string;
}

export interface ExecutionContext {
  actor: Actor;
  agentId?: string;
  /** Present when the call is being replayed after a human approved it. */
  approval?: { approvalId: string; decidedBy: string };
  /** Audit sink. The gateway writes every attempt here, including blocked ones. */
  audit: (event: AuditEvent) => void;
  /** Progress callback for UI execution metadata. */
  onProgress?: (message: string) => void;
}

export interface ToolExecution<T = unknown> {
  executionId: string;
  toolId: string;
  result: ExecutionResult;
  durationMs: number;
  data?: T;
  summary: string;
  reason?: string;
}
