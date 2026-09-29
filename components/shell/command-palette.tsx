"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  LayoutGrid,
  MessageSquareText,
  Package,
  Play,
  PlugZap,
  Receipt,
  Search,
  Workflow,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Dialog as DialogPrimitive } from "radix-ui";
import { customers } from "@/lib/mock/company";
import { formatLakh } from "@/lib/utils";
import { askHref } from "./links";
import { useUI } from "./ui-store";

export function CommandPalette() {
  const overlay = useUI((s) => s.overlay);
  const close = useUI((s) => s.close);
  const openOverlay = useUI((s) => s.open);
  const router = useRouter();
  const [page, setPage] = useState<"root" | "customers">("root");
  const [query, setQuery] = useState("");

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setPage("root");
      setQuery("");
    }
  };

  return (
    <Dialog open={overlay === "palette"} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-[580px] overflow-hidden p-0" aria-describedby={undefined}>
        <DialogPrimitive.Title className="sr-only">Command menu</DialogPrimitive.Title>
        <Command
          loop
          onKeyDown={(e) => {
            if (page !== "root" && (e.key === "Escape" || (e.key === "Backspace" && !query))) {
              e.preventDefault();
              setPage("root");
            }
          }}
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={page === "customers" ? "Search customers…" : "Type a command or search…"}
          />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            {page === "root" ? (
              <>
                <CommandGroup heading="Navigate">
                  <CommandItem onSelect={() => go("/")}><LayoutGrid /> Go to Overview</CommandItem>
                  <CommandItem onSelect={() => go("/ask")}><MessageSquareText /> Ask Operator</CommandItem>
                  <CommandItem onSelect={() => go("/approvals")}><CheckCircle2 /> Review approvals</CommandItem>
                  <CommandItem onSelect={() => go("/connections")}><PlugZap /> View connections</CommandItem>
                  <CommandItem onSelect={() => go("/activity")}><Activity /> View activity</CommandItem>
                  <CommandItem onSelect={() => go("/agents")}><Bot /> View agents</CommandItem>
                  <CommandItem onSelect={() => go("/workflows")}><Workflow /> View workflows</CommandItem>
                  <CommandItem onSelect={() => go("/tools")}><Wrench /> View tools</CommandItem>
                  <CommandItem onSelect={() => go("/analytics")}><BarChart3 /> View analytics</CommandItem>
                </CommandGroup>
                <CommandGroup heading="Actions">
                  <CommandItem onSelect={() => openOverlay("runWorkflow")}><Play /> Run workflow</CommandItem>
                  <CommandItem
                    keywords={["customer", "account", "company"]}
                    onSelect={() => {
                      setPage("customers");
                      setQuery("");
                    }}
                  >
                    <Search /> Search customer
                    <span className="ml-auto text-xs text-subtle">↵</span>
                  </CommandItem>
                  <CommandItem onSelect={() => go(askHref("Show low-stock products."))}><Package /> Check inventory</CommandItem>
                  <CommandItem onSelect={() => go("/finance")}><Receipt /> Review overdue invoices</CommandItem>
                </CommandGroup>
              </>
            ) : (
              <CommandGroup
                heading={
                  <span className="flex items-center gap-1.5">
                    <button onClick={() => setPage("root")} className="rounded p-0.5 hover:bg-hover" aria-label="Back">
                      <ArrowLeft className="size-3" />
                    </button>
                    Customers
                  </span>
                }
              >
                {customers.map((c) => (
                  <CommandItem key={c.id} value={`${c.name} ${c.city}`} onSelect={() => go(askHref(`Show account summary for ${c.name}.`))}>
                    <Building2 />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-subtle">{c.city} · {formatLakh(c.lifetimeValue)} LTV</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="flex items-center gap-4 border-t border-line bg-surface-muted px-4 py-2 text-2xs text-muted">
            <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> Select</span>
            <span className="flex items-center gap-1.5"><Kbd>esc</Kbd> {page === "root" ? "Close" : "Back"}</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
