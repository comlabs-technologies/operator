"use client";

import { Bot, Workflow } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/shell/app-sidebar";
import type { AuditEvent } from "@/lib/mcp/types";
import { listTools } from "@/lib/mcp/registry";
import { useOperator } from "@/lib/store";
import { relativeTime } from "@/lib/utils";

const writeTools = new Set(listTools().filter((t) => t.type === "write").map((t) => t.id));

/** Feed shows actions people care about: writes and decisions, not lookups or blocked attempts. */
function isFeedEvent(e: AuditEvent) {
  if (e.result === "blocked" || e.result === "failed") return false;
  return e.toolId ? writeTools.has(e.toolId) : true;
}

const firstName = (name: string) => name.split(" ")[0];

/** "Rahul via Sales Assistant", "Finance Assistant", "Priya". */
export function actorLabel(e: AuditEvent, short = false) {
  if (e.actor.type === "agent" && e.actor.onBehalfOf) {
    return short ? firstName(e.actor.onBehalfOf) : `${firstName(e.actor.onBehalfOf)} via ${e.actor.name}`;
  }
  if (e.actor.type === "user") return short ? firstName(e.actor.name) : e.actor.name;
  return e.actor.name;
}

export function ActorMark({ event }: { event: AuditEvent }) {
  if (event.actor.type === "user" || (event.actor.type === "agent" && event.actor.onBehalfOf)) {
    return <Avatar name={event.actor.type === "agent" ? event.actor.onBehalfOf! : event.actor.name} />;
  }
  const Icon = event.actor.type === "workflow" ? Workflow : Bot;
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line bg-surface-muted text-ink-2">
      <Icon className="size-3.5" strokeWidth={1.75} />
    </span>
  );
}

export function ActivityFeed({ limit = 5 }: { limit?: number }) {
  const activity = useOperator((s) => s.activity);
  const events = activity.filter(isFeedEvent).slice(0, limit);

  return (
    <ul className="divide-y divide-line">
      <AnimatePresence initial={false}>
        {events.map((e) => (
          <motion.li
            key={e.id}
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/activity?event=${e.id}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted sm:px-5">
              <ActorMark event={e} />
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium text-ink">{actorLabel(e, true)}</span>{" "}
                <span className="text-ink-2">{e.summary.charAt(0).toLowerCase() + e.summary.slice(1)}</span>
              </div>
              <span className="shrink-0 text-xs text-subtle tabular">{relativeTime(e.timestamp)}</span>
            </Link>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
