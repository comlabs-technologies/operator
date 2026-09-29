import { ReceivablesView } from "@/components/finance/receivables-view";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Receivables" };

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Receivables"
        description="Overdue invoices from the Custom ERP. Reminders are drafted by the Finance Assistant and sent only after approval."
        className="mb-6"
      />
      <ReceivablesView />
    </div>
  );
}
