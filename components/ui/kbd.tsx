import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-line bg-surface-muted px-1 font-sans text-2xs font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}
