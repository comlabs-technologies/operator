import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AgentDetail } from "@/components/agents/agent-detail";
import { agents, getAgent } from "@/lib/mock/agents";

export function generateStaticParams() {
  return agents.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getAgent(id)?.name ?? "Agent" };
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getAgent(id)) notFound();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <Suspense>
        <AgentDetail id={id} />
      </Suspense>
    </div>
  );
}
