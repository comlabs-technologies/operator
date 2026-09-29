import { Ban, Lock, ShieldCheck } from "lucide-react";
import { Badge, Dot } from "@/components/ui/badge";
import type { ToolAccess } from "@/lib/mock/agents";
import type { ApprovalStatus } from "@/lib/mock/approvals";
import type { ExecutionResult, RiskLevel, ToolStatus, ToolType } from "@/lib/mcp/types";

export function StatusBadge({ status }: { status: ToolStatus | "connected" | "syncing" | "error" | "paused" }) {
  switch (status) {
    case "active":
    case "connected":
      return (
        <Badge tone="green">
          <Dot /> {status === "active" ? "Active" : "Connected"}
        </Badge>
      );
    case "syncing":
      return (
        <Badge tone="blue">
          <Dot pulse /> Syncing
        </Badge>
      );
    case "approval_required":
      return (
        <Badge tone="amber">
          <ShieldCheck /> Approval required
        </Badge>
      );
    case "restricted":
      return (
        <Badge tone="neutral">
          <Lock /> Restricted
        </Badge>
      );
    case "disabled":
      return (
        <Badge tone="neutral" className="text-muted">
          <Ban /> Disabled
        </Badge>
      );
    case "paused":
      return (
        <Badge tone="neutral">
          <Dot className="text-subtle" /> Paused
        </Badge>
      );
    case "error":
      return (
        <Badge tone="red">
          <Dot /> Error
        </Badge>
      );
  }
}

const riskTone: Record<RiskLevel, "neutral" | "amber" | "red"> = {
  low: "neutral",
  medium: "amber",
  high: "red",
  critical: "red",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const bars = { low: 1, medium: 2, high: 3, critical: 4 }[risk];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={
              "w-[3px] rounded-[1px] " +
              (i <= bars
                ? riskTone[risk] === "red"
                  ? "bg-red"
                  : riskTone[risk] === "amber"
                    ? "bg-amber"
                    : "bg-ink-2"
                : "bg-line-strong")
            }
            style={{ height: 4 + i * 2 }}
          />
        ))}
      </span>
      <span className="capitalize">{risk}</span>
    </span>
  );
}

export function TypeBadge({ type }: { type: ToolType }) {
  return type === "read" ? <Badge tone="neutral">Read</Badge> : <Badge tone="blue">Write</Badge>;
}

export function PermissionBadge({ permission }: { permission: string }) {
  return <code className="rounded-[4px] bg-surface-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-2">{permission}</code>;
}

export function AccessBadge({ access }: { access: ToolAccess }) {
  if (access === "allowed") return <Badge tone="green">Allowed</Badge>;
  if (access === "approval") return <Badge tone="amber">Approval required</Badge>;
  return <Badge tone="red">Blocked</Badge>;
}

export function ResultBadge({ result }: { result: ExecutionResult }) {
  switch (result) {
    case "success":
      return (
        <Badge tone="green">
          <Dot /> Success
        </Badge>
      );
    case "blocked":
      return (
        <Badge tone="red">
          <Dot /> Blocked
        </Badge>
      );
    case "pending_approval":
      return (
        <Badge tone="amber">
          <Dot /> Awaiting approval
        </Badge>
      );
    case "failed":
      return (
        <Badge tone="red">
          <Dot /> Failed
        </Badge>
      );
  }
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  switch (status) {
    case "pending":
      return <Badge tone="amber">Pending</Badge>;
    case "approved":
      return <Badge tone="green">Approved</Badge>;
    case "rejected":
      return <Badge tone="red">Rejected</Badge>;
    case "changes_requested":
      return <Badge tone="blue">Changes requested</Badge>;
    case "superseded":
      return <Badge tone="neutral">Superseded</Badge>;
  }
}
