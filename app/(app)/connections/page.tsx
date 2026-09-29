import { ShieldCheck } from "lucide-react";
import { AddConnectionDialog } from "@/components/connections/add-connection-dialog";
import { ConnectionGrid } from "@/components/connections/connection-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Connections" };

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Connected systems"
        description="Sources Operator can securely read from or act on."
        actions={<AddConnectionDialog />}
        className="mb-6"
      />
      <ConnectionGrid />
      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-surface-muted px-4 py-3 text-xs leading-5 text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        Credentials are held by the Operator gateway and never passed to agents or models. Each system is exposed only as registered tools, with a permission scope and approval policy per tool.
      </div>
    </div>
  );
}
