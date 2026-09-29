import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-[5px] border px-1.5 text-2xs font-medium leading-none [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-line bg-surface-muted text-ink-2",
        outline: "border-line-strong bg-surface text-ink-2",
        green: "border-green-line bg-green-bg text-green",
        amber: "border-amber-line bg-amber-bg text-amber",
        red: "border-red-line bg-red-bg text-red",
        blue: "border-blue-line bg-blue-bg text-blue",
        dark: "border-transparent bg-ink text-primary-fg",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({ className, tone, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Dot({ className, pulse }: { className?: string; pulse?: boolean }) {
  return <span aria-hidden className={cn("inline-block size-1.5 shrink-0 rounded-full bg-current", pulse && "animate-pulse-dot", className)} />;
}
