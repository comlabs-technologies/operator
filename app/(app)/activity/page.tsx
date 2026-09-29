import { Suspense } from "react";
import { ActivityView } from "@/components/activity/activity-view";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Activity"
        description="Immutable audit log of every tool call, approval and blocked attempt across people, agents and workflows."
        className="mb-6"
      />
      <Suspense>
        <ActivityView />
      </Suspense>
    </div>
  );
}
