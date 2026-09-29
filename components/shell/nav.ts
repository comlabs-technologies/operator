import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  LayoutGrid,
  MessageSquareText,
  PlugZap,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "approvals";
}

export const navGroups: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/", label: "Overview", icon: LayoutGrid },
      { href: "/ask", label: "Ask", icon: MessageSquareText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/connections", label: "Connections", icon: PlugZap },
      { href: "/agents", label: "Agents", icon: Bot },
      { href: "/workflows", label: "Workflows", icon: Workflow },
      { href: "/approvals", label: "Approvals", icon: CheckCircle2, badge: "approvals" },
      { href: "/tools", label: "Tools", icon: Wrench },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/activity", label: "Activity", icon: Activity },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
