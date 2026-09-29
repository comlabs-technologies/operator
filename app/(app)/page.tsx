import { ActivityFeed } from "@/components/overview/activity-feed";
import { AttentionItem } from "@/components/overview/attention-item";
import { BusinessBrief } from "@/components/overview/business-brief";
import { LiveExecutions, PendingApprovalsLink } from "@/components/overview/live-values";
import { MetricGrid } from "@/components/overview/metric-grid";
import { askHref } from "@/components/shell/links";
import { SectionHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { currentUser, daysToMinimum, getCustomer, lowStock, metrics, overdueInvoices, stalledDeals, tataQuote } from "@/lib/mock/company";
import { formatINR, formatLakh, formatNumber } from "@/lib/utils";

export const metadata = { title: "Overview" };

function AgingBar() {
  const max = metrics.outstanding;
  return (
    <div className="max-w-md space-y-1.5">
      <div className="flex h-1.5 gap-[2px] overflow-hidden rounded-full">
        {overdueInvoices.map((inv) => (
          <span
            key={inv.id}
            title={`${getCustomer(inv.customerId)?.name} · ${formatINR(inv.amount)} · ${inv.daysOverdue} days`}
            className={inv.daysOverdue > 60 ? "bg-red/70" : inv.daysOverdue > 45 ? "bg-amber/80" : "bg-line-strong"}
            style={{ width: `${(inv.amount / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex gap-3 text-2xs text-muted">
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-red/70" />60+ days</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber/80" />46–60</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-line-strong" />31–45</span>
      </div>
    </div>
  );
}

function StalledDeals() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {stalledDeals.map((d) => (
        <span key={d.id} className="inline-flex h-6 items-center gap-1.5 rounded-md border border-line bg-surface px-2 text-xs text-ink-2">
          {getCustomer(d.customerId)?.name}
          <span className="tabular text-muted">{formatLakh(d.value)} · {d.daysInactive}d</span>
        </span>
      ))}
    </div>
  );
}

function StockBar() {
  const item = lowStock[0];
  const scale = 60;
  return (
    <div className="max-w-md space-y-1.5">
      <div className="relative h-1.5 rounded-full bg-surface-sunken">
        <span className="absolute inset-y-0 left-0 rounded-full bg-ink-2" style={{ width: `${(item.onHand / scale) * 100}%` }} />
        <span className="absolute -top-1 -bottom-1 w-px bg-amber" style={{ left: `${(item.minimum / scale) * 100}%` }} />
      </div>
      <div className="flex gap-3 text-2xs text-muted tabular">
        <span>{item.onHand} on hand</span>
        <span className="text-amber">Minimum {item.minimum}</span>
        <span>{item.dailyUsage}/day</span>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const modelX = lowStock[0];
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted">Good morning, {currentUser.firstName}</p>
          <h1 className="text-[22px] leading-8 font-medium tracking-[-0.02em] text-ink">Here&apos;s what needs your attention.</h1>
        </div>
        <PendingApprovalsLink />
      </div>

      <MetricGrid
        metrics={[
          { label: "Revenue this month", value: formatLakh(metrics.revenueThisMonth), delta: { value: `+${metrics.revenueYoY}%`, tone: "up" }, meta: "vs Sep 2025" },
          { label: "Outstanding", value: formatLakh(metrics.outstanding), meta: `${metrics.overdueInvoices} invoices overdue` },
          { label: "Open pipeline", value: formatLakh(metrics.openPipeline), meta: `${metrics.openOpportunities} opportunities` },
          { label: "AI actions", value: <LiveExecutions />, meta: `${formatNumber(metrics.hoursSaved)} hrs saved` },
        ]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          <section>
            <SectionHeader title="Needs attention" meta="3 items" className="mb-3" />
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              <AttentionItem
                category="Overdue invoices"
                level="high"
                title={<><span className="font-medium">{formatLakh(metrics.outstanding)}</span> across {metrics.overdueInvoices} customers</>}
                detail={<>Oldest invoice: {metrics.oldestOverdueDays} days · ABC Industries, {formatINR(overdueInvoices[0].amount)}</>}
                cta="Review payments"
                href="/finance"
                visual={<AgingBar />}
              />
              <AttentionItem
                category="Sales pipeline"
                level="medium"
                title={<>{stalledDeals.length} high-value opportunities have had no activity for 10+ days.</>}
                detail={<>{formatLakh(metrics.stalledValue)} of {formatLakh(metrics.openPipeline)} open pipeline</>}
                cta="Review deals"
                href={askHref("Which deals have had no activity in the last 10 days?")}
                visual={<StalledDeals />}
              />
              <AttentionItem
                category="Inventory"
                level="watch"
                title={<>Model-X inventory is projected to fall below minimum stock within {daysToMinimum(modelX)} days.</>}
                detail={<>{modelX.sku} · requisition PR-0231 awaiting approval</>}
                cta="View inventory"
                href={askHref("Show low-stock products.")}
                visual={<StockBar />}
              />
            </div>
          </section>

          <section>
            <SectionHeader
              title="Recent activity"
              className="mb-3"
              actions={
                <Link href="/activity" className="text-xs text-muted transition-colors hover:text-ink">
                  View audit log
                </Link>
              }
            />
            <div className="overflow-hidden rounded-xl border border-line">
              <ActivityFeed />
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-[76px] lg:self-start">
          <BusinessBrief
            items={[
              <>Revenue is currently tracking <strong className="font-medium text-ink">{metrics.revenueVsLastMonth}% above last month</strong>.</>,
              <><strong className="font-medium text-ink">{formatLakh(metrics.outstanding)}</strong> remains outstanding across six customers.</>,
              <>Four opportunities worth <strong className="font-medium text-ink">{formatLakh(metrics.stalledValue)}</strong> have had no recorded activity for more than 10 days.</>,
              <>Model-X inventory may fall below minimum stock within <strong className="font-medium text-ink">six days</strong>.</>,
              <>A <strong className="font-medium text-ink">{formatLakh(tataQuote.total)}</strong> Tata Engineering quotation is awaiting discount approval.</>,
            ]}
            questions={["Why are receivables increasing?", "Which deals need attention?", "What should I follow up on today?"]}
          />
        </aside>
      </div>
    </div>
  );
}
