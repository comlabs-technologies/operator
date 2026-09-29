import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-subtle focus-visible:border-ink/40 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm leading-6 text-ink shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-subtle focus-visible:border-ink/40 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-xs font-medium text-ink-2", className)} {...props} />;
}
