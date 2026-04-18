"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

function LoadingSpinner({ size = "md", className, label, ...props }: LoadingSpinnerProps) {
  return (
    <div className="inline-flex flex-col items-center gap-2" role="status" aria-label={label ?? "Loading"}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn("animate-spin text-clay-500", sizeMap[size], className)}
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="text-xs text-earth-500">{label}</span>
      )}
    </div>
  );
}

export { LoadingSpinner };
