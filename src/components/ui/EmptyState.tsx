"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: React.ReactNode;
}

function ClayVesselIllustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className="h-24 w-24"
      aria-hidden="true"
    >
      {/* Base plate */}
      <ellipse cx="60" cy="95" rx="30" ry="6" fill="#d3c9b6" />
      {/* Vessel body */}
      <path
        d="M35 85 Q28 65 32 45 Q36 30 60 28 Q84 30 88 45 Q92 65 85 85 Z"
        fill="#dfbf9b"
      />
      {/* Vessel highlight */}
      <path
        d="M45 55 Q42 45 48 38 Q54 32 60 32"
        stroke="#fdf8f4"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Rim */}
      <ellipse cx="60" cy="30" rx="24" ry="5" fill="#cf9d6e" />
      {/* Inner shadow */}
      <ellipse cx="60" cy="30" rx="18" ry="3" fill="#a8683b" opacity="0.4" />
      {/* Texture lines */}
      <path d="M38 60 Q60 57 82 60" stroke="#c0824a" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <path d="M36 70 Q60 67 84 70" stroke="#c0824a" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <path d="M37 80 Q60 77 83 80" stroke="#c0824a" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyState({
  className,
  title,
  description,
  ctaLabel,
  onCta,
  icon,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 px-6 text-center",
        className
      )}
      {...props}
    >
      <div className="text-earth-300">
        {icon ?? <ClayVesselIllustration />}
      </div>
      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="font-display text-base font-semibold text-earth-700">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-earth-500 text-balance">{description}</p>
        )}
      </div>
      {ctaLabel && onCta && (
        <Button variant="primary" size="md" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
