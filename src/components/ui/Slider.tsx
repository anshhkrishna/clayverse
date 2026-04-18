"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  orientation?: "horizontal" | "vertical";
  showMinMax?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      label,
      showValue = true,
      orientation = "horizontal",
      showMinMax = false,
      min = 0,
      max = 100,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const displayValue = value?.[0] ?? defaultValue?.[0] ?? min;
    const isVertical = orientation === "vertical";

    return (
      <div
        className={cn(
          "flex gap-2",
          isVertical ? "flex-row items-center" : "flex-col"
        )}
      >
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-xs font-medium text-earth-600">{label}</span>
            )}
            {showValue && (
              <span className="text-xs tabular-nums text-earth-500">
                {typeof displayValue === "number"
                  ? displayValue.toFixed(1)
                  : displayValue}
              </span>
            )}
          </div>
        )}
        <div
          className={cn(
            "flex items-center gap-1.5",
            isVertical && "flex-col"
          )}
        >
          {showMinMax && (
            <span className="text-xs text-earth-400 tabular-nums">{min}</span>
          )}
          <SliderPrimitive.Root
            ref={ref}
            min={min}
            max={max}
            value={value}
            defaultValue={defaultValue}
            orientation={orientation}
            className={cn(
              "relative flex touch-none select-none items-center",
              isVertical
                ? "h-32 w-5 flex-col"
                : "h-5 w-full flex-row",
              className
            )}
            {...props}
          >
            <SliderPrimitive.Track
              className={cn(
                "relative grow overflow-hidden rounded-full bg-earth-200",
                isVertical ? "w-1.5 h-full" : "h-1.5 w-full"
              )}
            >
              <SliderPrimitive.Range
                className={cn(
                  "absolute bg-clay-500",
                  isVertical ? "w-full bottom-0" : "h-full left-0"
                )}
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className={cn(
                "block h-4 w-4 rounded-full border-2 border-clay-500 bg-white",
                "shadow-sm ring-offset-white transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 focus-visible:ring-offset-2",
                "hover:scale-110 active:scale-95 cursor-pointer"
              )}
            />
          </SliderPrimitive.Root>
          {showMinMax && (
            <span className="text-xs text-earth-400 tabular-nums">{max}</span>
          )}
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
