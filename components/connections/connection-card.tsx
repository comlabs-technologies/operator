"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/badges";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import type { Connection } from "@/lib/mock/connections";
import { useOperator } from "@/lib/store";

export function ConnectionCard({ connection: c }: { connection: Connection }) {
  return (
    <Link
      href={`/connections/${c.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="flex items-center gap-3">
          <ConnectionIcon kind={c.kind} size="lg" />
          <div>
            <div className="text-sm font-medium text-ink">{c.name}</div>
            <div className="text-xs text-muted">{c.category}</div>
          </div>
        </div>
        <ArrowUpRight className="size-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="line-clamp-2 min-h-10 px-4 pt-3 text-xs leading-5 text-muted">{c.description}</p>
      <dl className="mt-4 grid grid-cols-3 border-t border-line text-xs">
        <div className="px-4 py-2.5">
          <dt className="text-subtle">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={c.status} />
          </dd>
        </div>
        <div className="border-l border-line px-4 py-2.5">
          <dt className="text-subtle">Tools</dt>
          <dd className="tabular mt-1 text-sm text-ink">{c.status === "syncing" && !c.toolCount ? "—" : c.toolCount}</dd>
        </div>
        <div className="border-l border-line px-4 py-2.5">
          <dt className="text-subtle">{c.access === "Read-only" ? "Access" : "Last synced"}</dt>
          <dd className="mt-1 truncate text-sm text-ink-2">{c.access === "Read-only" ? "Read-only" : c.lastSynced}</dd>
        </div>
      </dl>
    </Link>
  );
}

export function ConnectionGrid() {
  const connections = useOperator((s) => s.connections);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {connections.map((c) => (
        <ConnectionCard key={c.id} connection={c} />
      ))}
    </div>
  );
}
