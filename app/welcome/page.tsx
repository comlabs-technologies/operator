import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shell/app-sidebar";
import { ConnectionIcon } from "@/components/shared/connection-icon";
import { Button } from "@/components/ui/button";
import { connections } from "@/lib/mock/connections";
import { metrics } from "@/lib/mock/company";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Welcome" };

export default function WelcomePage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <div className="max-w-md space-y-4 py-16">
          <h1 className="text-[28px] leading-9 font-medium tracking-[-0.025em] text-ink">Your business, connected to AI.</h1>
          <p className="text-[15px] leading-6 text-muted">
            One secure layer for tools, workflows, approvals, and business intelligence. Operator connects your CRM, ERP and data to agents that work
            inside your permissions — and asks before anything important happens.
          </p>
          <ol className="space-y-1.5 pt-2 font-mono text-xs text-ink-2">
            {["Business systems", "Secure tools", "Orchestration", "Approvals", "Actions", "Audit log"].map((s, i) => (
              <li key={s} className="flex items-center gap-2.5">
                <span className="w-4 text-subtle">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-subtle">Demo workspace · all data is fictional</p>
      </div>
      <div className="flex items-center justify-center border-line bg-surface px-6 py-12 lg:border-l">
        <div className="w-full max-w-sm rounded-xl border border-line bg-surface shadow-sm">
          <div className="border-b border-line px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg border border-line-strong bg-surface-muted text-sm font-semibold text-ink">A</span>
              <div>
                <div className="text-sm font-medium text-ink">Acme Industrial</div>
                <div className="text-xs text-muted">Industrial machinery · Pune</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Connected systems</span>
              <span className="flex -space-x-1">
                {connections.map((c) => (
                  <ConnectionIcon key={c.id} kind={c.kind} size="sm" className="ring-2 ring-surface" />
                ))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Tool executions this month</span>
              <span className="tabular text-ink">{formatNumber(metrics.toolExecutions)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Signed in as</span>
              <span className="text-ink">Pawan · Managing Director</span>
            </div>
          </div>
          <div className="border-t border-line px-5 py-4">
            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href="/">
                Open demo workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
