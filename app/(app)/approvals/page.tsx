import { Suspense } from "react";
import { ApprovalsView } from "@/components/approvals/approvals-view";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Approvals" };

export default function ApprovalsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Approvals"
        description="Actions held by policy until a person decides. Approved actions run through the gateway and are written to the audit log."
        className="mb-6"
      />
      <Suspense>
        <ApprovalsView />
      </Suspense>
    </div>
  );
}
