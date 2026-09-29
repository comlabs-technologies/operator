"use client";

import { KeyRound } from "lucide-react";
import { ActorMark, actorLabel } from "@/components/overview/activity-feed";
import { ResultBadge, PermissionBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { DetailList, FieldLabel } from "@/components/shared/detail-list";
import { JsonBlock } from "@/components/shared/json-block";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AuditEvent } from "@/lib/mcp/types";
import { useOperator } from "@/lib/store";
import { formatDuration, logTime } from "@/lib/utils";

function approvalText(e: AuditEvent) {
  switch (e.approval.status) {
    case "not_required":
      return <span className="text-ink-2">Not required</span>;
    case "pending":
      return <Badge tone="amber">Pending{e.approval.approvalId ? ` · ${e.approval.approvalId}` : ""}</Badge>;
    case "approved":
      return (
        <span className="text-ink-2">
          Approved by {e.approval.decidedBy}
          {e.approval.approvalId && <span className="text-muted"> · {e.approval.approvalId}</span>}
        </span>
      );
    case "rejected":
      return <span className="text-ink-2">Rejected by {e.approval.decidedBy}</span>;
  }
}

export function ExecutionDrawer({ event, onClose }: { event: AuditEvent | undefined; onClose: () => void }) {
  const connections = useOperator((s) => s.connections);
  const connection = event?.connection ? connections.find((c) => c.id === event.connection) : undefined;

  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        {event && (
          <>
            <SheetHeader>
              <div className="mb-1.5 flex items-center gap-2">
                <ResultBadge result={event.result} />
                <span className="text-xs text-muted">{logTime(event.timestamp)}</span>
              </div>
              <SheetTitle className="font-mono text-[14px]">{event.action}</SheetTitle>
              <SheetDescription>{event.summary}</SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-6">
              <DetailList
                items={[
                  { label: "Execution ID", value: <span className="font-mono text-xs">{event.executionId}</span> },
                  {
                    label: "Principal",
                    value: (
                      <span className="flex items-center gap-2">
                        <ActorMark event={event} /> {actorLabel(event)}
                      </span>
                    ),
                  },
                  {
                    label: "Connection",
                    value: connection ? (
                      <span className="flex items-center gap-2">
                        <ConnectionIcon kind={connection.kind} size="sm" /> {connection.name}
                      </span>
                    ) : (
                      <span className="text-muted">Operator (internal)</span>
                    ),
                  },
                  { label: "Resource", value: event.resource },
                  {
                    label: "Permission checked",
                    value: event.permission ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <PermissionBadge permission={event.permission} />
                        <Badge tone={event.permissionDecision === "denied" ? "red" : "green"}>{event.permissionDecision === "denied" ? "Denied" : "Granted"}</Badge>
                      </span>
                    ) : (
                      "—"
                    ),
                  },
                  { label: "Approval", value: approvalText(event) },
                  { label: "Duration", value: <span className="tabular">{formatDuration(event.durationMs)}</span> },
                ]}
              />

              {event.reason && (
                <div className={event.result === "blocked" ? "rounded-lg border border-red-line bg-red-bg px-3.5 py-3 text-sm text-red" : "rounded-lg border border-amber-line bg-amber-bg px-3.5 py-3 text-sm text-amber"}>
                  {event.reason}
                </div>
              )}

              <div>
                <FieldLabel>Input</FieldLabel>
                <JsonBlock value={event.input ?? {}} />
              </div>
              <div>
                <FieldLabel>Output</FieldLabel>
                <JsonBlock value={event.output ?? null} className="max-h-72" />
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-line px-3.5 py-3 text-xs text-muted">
                <KeyRound className="mt-px size-3.5 shrink-0" />
                Credentials for {connection?.name ?? "this connection"} are held by the gateway and never included in inputs, outputs, or model context.
              </div>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
