"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn("flex flex-col overflow-hidden", className)} {...props} />;
}

export function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex h-12 items-center gap-2.5 border-b border-line px-4">
      <Search className="size-4 shrink-0 text-subtle" />
      <CommandPrimitive.Input
        className={cn("h-full flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-subtle", className)}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "scrollbar-thin max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-1.5 transition-[height] duration-150 [height:var(--cmdk-list-height)]",
        className,
      )}
      {...props}
    />
  );
}

export function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-10 text-center text-sm text-muted" {...props} />;
}

export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-ink-2 select-none data-[selected=true]:bg-hover data-[selected=true]:text-ink [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted",
        className,
      )}
      {...props}
    />
  );
}
