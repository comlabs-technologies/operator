import { Avatar } from "@/components/shell/app-sidebar";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { DetailList } from "@/components/shared/detail-list";
import { Badge, Dot } from "@/components/ui/badge";
import { company, team } from "@/lib/mock/company";
import { providerCatalog } from "@/lib/runtime/router";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[960px] space-y-10 px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader title="Settings" description="Workspace configuration for Acme Industrial." />

      <section>
        <SectionHeader title="Workspace" className="mb-3" />
        <DetailList
          items={[
            { label: "Name", value: company.name },
            { label: "Industry", value: company.industry },
            { label: "Region", value: `${company.region} · data stored in ap-south-1 (Mumbai)` },
            { label: "Plan", value: company.plan },
            { label: "Audit retention", value: "7 years · immutable" },
          ]}
        />
      </section>

      <section>
        <SectionHeader title="Model providers" meta="Operator is provider-independent" className="mb-3" />
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {providerCatalog.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm text-ink">{p.name}</div>
                <div className="text-xs text-muted">{p.detail}</div>
              </div>
              {p.status === "active" ? (
                <Badge tone="green">
                  <Dot /> In use
                </Badge>
              ) : (
                <Badge tone="outline">Adapter available</Badge>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Models plan tool calls and write summaries. They never hold credentials — every call passes through the gateway&apos;s permission and approval checks.
        </p>
      </section>

      <section>
        <SectionHeader title="Members" meta={`${team.length} people`} className="mb-3" />
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {team.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar name={m.name} />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-ink">{m.name}</div>
                <div className="truncate text-xs text-muted">{m.email}</div>
              </div>
              <span className="text-xs text-ink-2">{m.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
