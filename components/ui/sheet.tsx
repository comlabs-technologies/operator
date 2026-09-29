"use client";

import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetClose = SheetPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "right" | "left" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/15 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col bg-surface shadow-panel outline-none",
          side === "right" &&
            "inset-y-0 right-0 h-full w-full border-l border-line sm:inset-y-2 sm:right-2 sm:h-[calc(100%-16px)] sm:max-w-[520px] sm:rounded-xl sm:border data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in",
          side === "left" &&
            "inset-y-0 left-0 h-full w-[272px] border-r border-line data-[state=closed]:animate-sheet-left-out data-[state=open]:animate-sheet-left-in",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative border-b border-line px-5 pt-4 pb-4", className)} {...props}>
      {children}
      <SheetPrimitive.Close className="absolute top-3.5 right-3.5 grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </div>
  );
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn("pr-8 text-[15px] font-medium text-ink", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn("text-sm text-muted", className)} {...props} />;
}

export function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("scrollbar-thin flex-1 overflow-y-auto px-5 py-5", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2 border-t border-line bg-surface-muted px-5 py-3 sm:rounded-b-xl", className)} {...props} />;
}
