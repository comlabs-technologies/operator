import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ToolTable } from "@/components/tools/tool-table";
import { listTools } from "@/lib/mcp/registry";

export const metadata = { title: "Tools" };

export default function ToolsPage() {
  const tools = listTools();
  const write = tools.filter((t) => t.type === "write").length;
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Tools"
        description={`${tools.length} registered actions across your connected systems — ${tools.length - write} read, ${write} write. Each carries a permission scope, risk level and approval policy.`}
        className="mb-6"
      />
      <Suspense>
        <ToolTable />
      </Suspense>
    </div>
  );
}
