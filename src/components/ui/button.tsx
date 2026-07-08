import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-app border-2 border-ink text-sm font-display font-bold uppercase tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-cargo-amber text-ink shadow-stamp-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-stamp active:translate-x-0 active:translate-y-0 active:shadow-stamp-sm",
        primary:
          "bg-cargo-amber text-ink shadow-stamp-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-stamp active:translate-x-0 active:translate-y-0 active:shadow-stamp-sm",
        secondary:
          "bg-paper text-ink hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 active:shadow-none",
        outline:
          "bg-transparent text-ink hover:bg-paper/50",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-paper/50",
        danger:
          "bg-alert-red text-paper shadow-stamp-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-stamp active:translate-x-0 active:translate-y-0 active:shadow-stamp-sm",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };