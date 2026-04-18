"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, description, id, ...props }, ref) => {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "bg-earth-200 data-[state=checked]:bg-clay-500",
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm",
            "transition-transform duration-200",
            "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-earth-800 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-earth-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = "Switch";

export { Switch };
