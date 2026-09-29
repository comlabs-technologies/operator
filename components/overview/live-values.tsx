"use client";

import Link from "next/link";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { usePendingCount, useToolExecutions } from "@/lib/store";

export function LiveExecutions() {
  return <AnimatedNumber value={useToolExecutions()} />;
}

export function PendingApprovalsLink() {
  const pending = usePendingCount();
  if (!pending) return null;
  return (
    <Link
      href="/approvals"
      className="inline-flex h-8 items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink-2 shadow-xs transition-colors hover:bg-hover hover:text-ink"
    >
      <span className="size-1.5 rounded-full bg-amber" />
      <span className="tabular">{pending}</span> approvals waiting
    </Link>
  );
}
