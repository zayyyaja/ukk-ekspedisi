import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-primary/20",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "border-transparent bg-slate-100 text-ink hover:bg-slate-200",
        success: "border-transparent bg-green-50 text-green-700 hover:bg-green-100",
        warning: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100",
        danger: "border-transparent bg-red-50 text-red-700 hover:bg-red-100",
        info: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100",
        outline: "border-border text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
