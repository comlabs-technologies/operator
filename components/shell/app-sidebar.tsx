"use client";

import { ChevronsUpDown, Keyboard, LogOut, PanelLeft, RotateCcw, Settings, Check } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { company, currentUser } from "@/lib/mock/company";
import { usePendingCount, useOperator } from "@/lib/store";
import { cn } from "@/lib/utils";
import { isActive, navGroups } from "./nav";
import { useUI } from "./ui-store";

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-[22px] shrink-0 place-items-center rounded-[6px] bg-ink">
        <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
          <circle cx="8" cy="8" r="5" fill="none" stroke="#fafaf9" strokeWidth="2" />
          <circle cx="8" cy="8" r="1.6" fill="#fafaf9" />
        </svg>
      </span>
      {!collapsed && <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">Operator</span>}
    </div>
  );
}

export function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const pending = usePendingCount();

  return (
    <nav className="flex flex-col gap-4">
      {navGroups.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-px">
          {group.label && !collapsed && <div className="px-2 pb-1 text-2xs font-medium text-subtle">{group.label}</div>}
          {group.label && collapsed && <div className="mx-auto mb-1 h-px w-5 bg-line-strong" />}
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            const count = item.badge === "approvals" ? pending : 0;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-[30px] items-center gap-2.5 rounded-md px-2 text-sm transition-colors duration-150",
                  active ? "bg-[#ebebe7] text-ink" : "text-ink-2 hover:bg-[#efefec] hover:text-ink",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className={cn("size-4 shrink-0", active ? "text-ink" : "text-muted group-hover:text-ink-2")} strokeWidth={1.75} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {count > 0 &&
                  (collapsed ? (
                    <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-amber" />
                  ) : (
                    <span className="tabular rounded-[5px] bg-surface px-1.5 text-2xs leading-[18px] font-medium text-ink-2 shadow-[0_0_0_1px_var(--line)]">
                      {count}
                    </span>
                  ))}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href} content={item.label} side="right">
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function SidebarFooter({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const reset = useOperator((s) => s.reset);
  const open = useUI((s) => s.open);

  const settings = (
    <Link
      href="/settings"
      onClick={onNavigate}
      className={cn(
        "flex h-[30px] items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
        isActive(pathname, "/settings") ? "bg-[#ebebe7] text-ink" : "text-ink-2 hover:bg-[#efefec] hover:text-ink",
        collapsed && "justify-center px-0",
      )}
    >
      <Settings className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
      {!collapsed && "Settings"}
    </Link>
  );

  return (
    <div className="flex flex-col gap-px">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex h-[30px] items-center gap-2.5 rounded-md px-2 text-left text-sm text-ink-2 outline-none transition-colors hover:bg-[#efefec] data-[state=open]:bg-[#efefec]",
            collapsed && "justify-center px-0",
          )}
        >
          <span className="grid size-4 shrink-0 place-items-center rounded-[4px] border border-line-strong bg-surface text-[9px] font-semibold text-ink">A</span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{company.name}</span>
              <ChevronsUpDown className="size-3.5 text-subtle" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuItem>
            <span className="grid size-4 place-items-center rounded-[4px] border border-line-strong bg-surface text-[9px] font-semibold text-ink">A</span>
            <span className="flex-1">{company.name}</span>
            <Check className="!text-ink" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/settings")}>
            <Settings /> Workspace settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {collapsed ? <Tooltip content="Settings" side="right">{settings}</Tooltip> : settings}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "mt-1 flex h-9 items-center gap-2.5 rounded-md px-1.5 text-left outline-none transition-colors hover:bg-[#efefec] data-[state=open]:bg-[#efefec]",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar name={currentUser.name} />
          {!collapsed && (
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm text-ink">{currentUser.name}</span>
              <span className="block truncate text-2xs text-muted">{currentUser.role}</span>
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => open("shortcuts")}>
            <Keyboard /> Keyboard shortcuts
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              reset();
              toast("Demo workspace reset", { description: "Approvals, activity and connections are back to their starting state." });
            }}
          >
            <RotateCcw /> Reset demo data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/welcome")}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full bg-[#dedcd5] text-[10px] font-semibold text-ink-2",
        className,
      )}
    >
      {name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}

export function AppSidebar() {
  const collapsed = useUI((s) => s.collapsed);
  const setCollapsed = useUI((s) => s.setCollapsed);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col py-3 transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[60px] px-2" : "w-[240px] px-3",
      )}
    >
      <div className={cn("mb-5 flex h-8 items-center", collapsed ? "justify-center" : "justify-between pl-1.5")}>
        {collapsed ? (
          <Tooltip content="Expand sidebar" side="right" shortcut="⌘B">
            <button onClick={() => setCollapsed(false)} className="rounded-md p-1 hover:bg-[#efefec]" aria-label="Expand sidebar">
              <Logo collapsed />
            </button>
          </Tooltip>
        ) : (
          <>
            <Logo />
            <Tooltip content="Collapse sidebar" shortcut="⌘B">
              <button
                onClick={() => setCollapsed(true)}
                className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-[#efefec] hover:text-ink"
                aria-label="Collapse sidebar"
              >
                <PanelLeft className="size-4" strokeWidth={1.75} />
              </button>
            </Tooltip>
          </>
        )}
      </div>
      <div className="scrollbar-thin -mx-1 flex-1 overflow-y-auto px-1">
        <SidebarNav collapsed={collapsed} />
      </div>
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
