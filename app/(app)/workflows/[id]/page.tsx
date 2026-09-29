import { notFound } from "next/navigation";
import { WorkflowDetail } from "@/components/workflows/workflow-diagram";
import { getWorkflow, workflows } from "@/lib/mock/workflows";

export function generateStaticParams() {
  return workflows.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getWorkflow(id)?.name ?? "Workflow" };
}

export default async function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <WorkflowDetail workflow={workflow} />
    </div>
  );
}
