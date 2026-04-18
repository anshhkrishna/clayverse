"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ModelingMode } from "@/types";

const MODES: { value: ModelingMode; label: string; icon: string }[] = [
  { value: "wheel", label: "Wheel", icon: "⟳" },
  { value: "handbuilding", label: "Hand-build", icon: "✋" },
  { value: "sculpting", label: "Sculpt", icon: "◆" },
  { value: "tile", label: "Tile", icon: "⊞" },
  { value: "jewelry", label: "Jewelry", icon: "◎" },
];

export interface ModeSelectorProps {
  value: ModelingMode;
  onModeChange: (mode: ModelingMode) => void;
  className?: string;
  compact?: boolean;
}

export function ModeSelector({
  value,
  onModeChange,
  className,
  compact = false,
}: ModeSelectorProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-xl bg-earth-100 p-1 gap-0.5",
        className
      )}
      role="tablist"
      aria-label="Modeling mode"
    >
      {MODES.map((mode) => {
        const isActive = value === mode.value;
        return (
          <button
            key={mode.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(mode.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-clay-500",
              isActive
                ? "text-earth-900"
                : "text-earth-500 hover:text-earth-700"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-lg bg-white clay-shadow"
                transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10" aria-hidden="true">
              {mode.icon}
            </span>
            {!compact && (
              <span className="relative z-10">{mode.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
