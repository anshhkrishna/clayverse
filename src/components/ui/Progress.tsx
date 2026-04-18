"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, label, showValue = false, size = "md", ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {(label || showValue) && (
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-xs font-medium text-earth-600">{label}</span>
        )}
        {showValue && (
          <span className="text-xs tabular-nums text-earth-500">
            {Math.round(value ?? 0)}%
          </span>
        )}
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-earth-200",
        sizeMap[size],
        className
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-clay-500 transition-all duration-500 ease-out rounded-full"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
