"use client";

import { Bell, ChevronRight, Menu, Play, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog as SheetTitleRoot } from "radix-ui";
import { getAgent } from "@/lib/mock/agents";
import { getWorkflow } from "@/lib/mock/workflows";
import { useOperator } from "@/lib/store";
import { cn, relativeTime } from "@/lib/utils";
import { Logo, SidebarFooter, SidebarNav } from "./app-sidebar";
import { useUI } from "./ui-store";

const titles: Record<string, string> = {
  "": "Overview",
  ask: "Ask",
  connections: "Connections",
  agents: "Agents",
  workflows: "Workflows",
  approvals: "Approvals",
  tools: "Tools",
  activity: "Activity",
  analytics: "Analytics",
  settings: "Settings",
  finance: "Receivables",
};

function useCrumbs() {
  const pathname = usePathname();
  const connections = useOperator((s) => s.connections);
  const [section, id] = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: titles[section ?? ""] ?? "Operator", href: id ? `/${section}` : undefined }];
  if (id) {
    const label =
      section === "agents" ? getAgent(id)?.name : section === "workflows" ? getWorkflow(id)?.name : connections.find((c) => c.id === id)?.name;
    crumbs.push({ label: label ?? id });
  }
  return crumbs;
}

function Notifications() {
  const notifications = useOperator((s) => s.notifications);
  const markAllRead = useOperator((s) => s.markAllRead);
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover onOpenChange={(open) => !open && unread && markAllRead()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative">
          <Bell className="size-4" strokeWidth={1.75} />
          {unread > 0 && <span className="absolute top-[7px] right-[8px] size-1.5 rounded-full bg-amber ring-2 ring-surface" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
          <span className="text-sm font-medium">Notifications</span>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-muted hover:text-ink">
              Mark all read
            </button>
          )}
        </div>
        <ul className="scrollbar-thin max-h-[360px] overflow-y-auto py-1">
          {notifications.slice(0, 8).map((n) => (
            <li key={n.id}>
              <button
                onClick={() => router.push(n.href)}
                className="flex w-full gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-muted"
              >
                <span className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-amber")} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">{n.title}</span>
                  <span className="block truncate text-xs text-muted">{n.detail}</span>
                </span>
                <span className="shrink-0 text-2xs text-subtle">{relativeTime(n.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function TopHeader() {
  const crumbs = useCrumbs();
  const open = useUI((s) => s.open);
  const mobileNav = useUI((s) => s.mobileNav);
  const setMobileNav = useUI((s) => s.setMobileNav);

  return (
    <header className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-sm md:rounded-t-xl md:px-5">
      <Button variant="ghost" size="icon" className="-ml-1.5 md:hidden" aria-label="Open navigation" onClick={() => setMobileNav(true)}>
        <Menu className="size-4" />
      </Button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-subtle" />}
            {c.href ? (
              <Link href={c.href} className="truncate text-muted transition-colors hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-ink">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => open("search")}
          className="hidden h-8 w-56 items-center gap-2 rounded-md border border-line bg-surface-muted px-2.5 text-sm text-subtle transition-colors hover:border-line-strong hover:text-muted lg:flex"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search</span>
          <Kbd>/</Kbd>
        </button>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search" onClick={() => open("search")}>
          <Search className="size-4" strokeWidth={1.75} />
        </Button>
        <Notifications />
        <Button variant="primary" size="md" className="ml-1" onClick={() => open("runWorkflow")}>
          <Play className="size-3.5 fill-current" />
          <span className="hidden sm:inline">Run workflow</span>
        </Button>
      </div>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="bg-canvas px-3 py-3" aria-describedby={undefined}>
          <SheetTitleRoot.Title className="sr-only">Navigation</SheetTitleRoot.Title>
          <div className="mb-5 flex h-8 items-center pl-1.5">
            <Logo />
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setMobileNav(false)} />
          </div>
          <SidebarFooter onNavigate={() => setMobileNav(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
