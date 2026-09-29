import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 select-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg shadow-xs hover:bg-primary-hover active:bg-ink",
        secondary: "border border-line-strong bg-surface text-ink shadow-xs hover:bg-hover hover:border-line-strong active:bg-active",
        ghost: "text-ink-2 hover:bg-hover hover:text-ink active:bg-active",
        destructive: "border border-red-line bg-surface text-red shadow-xs hover:bg-red-bg active:bg-red-bg",
        link: "h-auto px-0 text-ink underline-offset-4 hover:underline active:translate-y-0",
      },
      size: {
        sm: "h-7 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-8 px-3",
        lg: "h-9 px-3.5",
        icon: "size-8",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
