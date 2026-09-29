import { Cloud, Contact, Database, Factory, FileCode2, FolderOpen, Globe, Mail, Plug, ShoppingBag } from "lucide-react";
import type { ConnectionKind } from "@/lib/mock/connections";
import { cn } from "@/lib/utils";

const icons: Record<ConnectionKind, typeof Globe> = {
  hubspot: Contact,
  erp: Factory,
  postgres: Database,
  mysql: Database,
  gmail: Mail,
  drive: FolderOpen,
  rest: Globe,
  openapi: FileCode2,
  salesforce: Cloud,
  shopify: ShoppingBag,
  custom: Plug,
};

export function ConnectionIcon({ kind, size = "md", className }: { kind: ConnectionKind; size?: "sm" | "md" | "lg"; className?: string }) {
  const Icon = icons[kind] ?? Plug;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-md border border-line bg-surface text-ink-2 shadow-xs",
        size === "sm" && "size-5 rounded-[5px] [&_svg]:size-3",
        size === "md" && "size-7 [&_svg]:size-3.5",
        size === "lg" && "size-9 rounded-lg [&_svg]:size-[18px]",
        className,
      )}
    >
      <Icon strokeWidth={1.75} />
    </span>
  );
}
