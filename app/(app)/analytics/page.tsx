import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Analytics" description="How work flows through Operator: volume, safety outcomes and where time is saved." className="mb-6" />
      <AnalyticsView />
    </div>
  );
}
