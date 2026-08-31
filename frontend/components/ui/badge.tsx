import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-navy text-white hover:bg-navy/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
        destructive:
          "border-transparent bg-red-50 text-red-700 hover:bg-red-100",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        warning:
          "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100",
        outline: "border-slate-200 text-slate-700",
        saffron: "border-transparent bg-saffron/10 text-saffron-700 hover:bg-saffron/20",
        sea: "border-transparent bg-sea/10 text-sea-700 hover:bg-sea/20",
        navy: "border-transparent bg-navy/10 text-navy-700 hover:bg-navy/20",
        green: "border-transparent bg-leaf/10 text-leaf-700 hover:bg-leaf/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
