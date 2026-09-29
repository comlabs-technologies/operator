"use client";

import { Bot, Building2, PlugZap, Workflow, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { listTools } from "@/lib/mcp/registry";
import { agents } from "@/lib/mock/agents";
import { customers } from "@/lib/mock/company";
import { workflows } from "@/lib/mock/workflows";
import { useOperator } from "@/lib/store";
import { formatLakh, formatNumber } from "@/lib/utils";
import { askHref } from "./links";
import { useUI } from "./ui-store";

const tools = listTools();

function Row({ icon: Icon, title, type, meta }: { icon: typeof Bot; title: string; type: string; meta: string }) {
  return (
    <>
      <Icon />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <span className="hidden truncate text-xs text-subtle sm:block">{meta}</span>
      <span className="w-[76px] shrink-0 text-right text-2xs text-subtle">{type}</span>
    </>
  );
}

export function SearchDialog() {
  const overlay = useUI((s) => s.overlay);
  const close = useUI((s) => s.close);
  const connections = useOperator((s) => s.connections);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const go = (href: string) => {
    close();
    setQuery("");
    router.push(href);
  };

  const q = query.trim();
  // Before typing, show a short cross-section rather than every record.
  const limit = <T,>(items: T[], n: number) => (q ? items : items.slice(0, n));

  return (
    <Dialog
      open={overlay === "search"}
      onOpenChange={(open) => {
        if (!open) {
          close();
          setQuery("");
        }
      }}
    >
      <DialogContent hideClose className="max-w-[640px] overflow-hidden p-0" aria-describedby={undefined}>
        <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
        <Command loop>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search customers, tools, agents, workflows, connections…" />
          <CommandList>
            <CommandEmpty>Nothing in this workspace matches “{query}”.</CommandEmpty>
            <CommandGroup heading="Customers">
              {limit(customers, 1).map((c) => (
                <CommandItem key={c.id} value={`customer ${c.name} ${c.city}`} onSelect={() => go(askHref(`Show account summary for ${c.name}.`))}>
                  <Row icon={Building2} title={c.name} type="Customer" meta={`${formatLakh(c.lifetimeValue)} lifetime value`} />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Tools">
              {limit(
                [...tools].sort((a, b) => (a.name === "create_quote" ? -1 : b.name === "create_quote" ? 1 : 0)),
                1,
              ).map((t) => (
                <CommandItem key={t.id} value={`tool ${t.name} ${t.connection}`} onSelect={() => go(`/tools?tool=${t.id}`)}>
                  <Row icon={Wrench} title={t.name} type="Tool" meta={`${connections.find((c) => c.id === t.connection)?.name} · ${formatNumber(t.executions)} runs`} />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Agents">
              {limit(agents, 1).map((a) => (
                <CommandItem key={a.id} value={`agent ${a.name}`} onSelect={() => go(`/agents/${a.id}`)}>
                  <Row icon={Bot} title={a.name} type="Agent" meta={`${Object.keys(a.tools).length} tools · ${formatNumber(a.executions)} runs`} />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Workflows">
              {limit(workflows, 1).map((w) => (
                <CommandItem key={w.id} value={`workflow ${w.name}`} onSelect={() => go(`/workflows/${w.id}`)}>
                  <Row icon={Workflow} title={w.name} type="Workflow" meta={w.trigger} />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Connections">
              {limit(connections, 1).map((c) => (
                <CommandItem key={c.id} value={`connection ${c.name}`} onSelect={() => go(`/connections/${c.id}`)}>
                  <Row icon={PlugZap} title={c.name} type="Connection" meta={`${c.toolCount} tools`} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
