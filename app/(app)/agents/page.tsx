import { AgentCard } from "@/components/agents/agent-card";
import { PageHeader } from "@/components/shared/page-header";
import { agents } from "@/lib/mock/agents";

export const metadata = { title: "Agents" };

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Agents"
        description="Operational configurations: which systems an agent can reach, which tools it may use, and what needs a person's approval."
        className="mb-6"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((a) => (
          <AgentCard key={a.id} agent={a} />
        ))}
      </div>
    </div>
  );
}
