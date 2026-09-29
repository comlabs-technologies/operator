import { PageHeader } from "@/components/shared/page-header";
import { WorkflowList } from "@/components/workflows/workflow-list";

export const metadata = { title: "Workflows" };

export default function WorkflowsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Workflows"
        description="Triggered sequences of tool calls. Steps that write to customers or money pause for approval."
        className="mb-6"
      />
      <WorkflowList />
    </div>
  );
}
