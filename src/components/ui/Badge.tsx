"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-earth-100 text-earth-700 border border-earth-200",
        success:
          "bg-sage-100 text-sage-700 border border-sage-200",
        warning:
          "bg-kiln-100 text-kiln-700 border border-kiln-200",
        error:
          "bg-red-100 text-red-700 border border-red-200",
        info:
          "bg-clay-100 text-clay-700 border border-clay-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
