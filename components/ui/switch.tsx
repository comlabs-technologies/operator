"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-[18px] w-[30px] shrink-0 items-center rounded-full border border-transparent bg-line-strong transition-colors data-[state=checked]:bg-ink",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-3.5 translate-x-px rounded-full bg-white shadow-xs transition-transform duration-150 data-[state=checked]:translate-x-[13px]" />
    </SwitchPrimitive.Root>
  );
}
