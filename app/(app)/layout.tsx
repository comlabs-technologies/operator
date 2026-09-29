import { Toaster } from "sonner";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { CommandPalette } from "@/components/shell/command-palette";
import { RunWorkflowDialog } from "@/components/shell/run-workflow-dialog";
import { SearchDialog } from "@/components/shell/search-dialog";
import { GlobalShortcuts, ShortcutsDialog } from "@/components/shell/shortcuts";
import { TopHeader } from "@/components/shell/top-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={200}>
      <div className="flex min-h-dvh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
          <div className="flex min-h-full flex-1 flex-col bg-surface md:rounded-xl md:border md:border-line md:shadow-xs">
            <TopHeader />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
      <CommandPalette />
      <SearchDialog />
      <RunWorkflowDialog />
      <ShortcutsDialog />
      <GlobalShortcuts />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-lg !border !border-line !bg-surface !shadow-pop !font-sans !text-sm !text-ink !gap-2",
            description: "!text-muted !text-xs",
            actionButton: "!bg-ink !text-primary-fg !rounded-md !text-xs !h-6",
          },
        }}
      />
    </TooltipProvider>
  );
}
