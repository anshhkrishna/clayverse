"use client";

import { useState } from "react";
import { ChevronRight, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIFormSuggestion } from "@/types";

interface SuggestionCardProps {
  suggestion: AIFormSuggestion;
  onApply: (suggestion: AIFormSuggestion) => void;
  isApplied?: boolean;
}

const PARAM_LABELS: Record<string, string> = {
  height: "Height",
  bodyRadius: "Body Radius",
  neckRadius: "Neck Radius",
  baseRadius: "Base Radius",
  wallThickness: "Wall",
  rimDiameter: "Rim Ø",
  shoulderHeight: "Shoulder",
  footRingHeight: "Foot Ring",
};

export function SuggestionCard({ suggestion, onApply, isApplied = false }: SuggestionCardProps) {
  const [glazeOpen, setGlazeOpen] = useState(false);

  const paramEntries = Object.entries(suggestion.parameters).slice(0, 6);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 transition-all",
        isApplied
          ? "border-clay-500 shadow-[0_0_0_2px_var(--color-clay-200)]"
          : "border-earth-200 hover:border-clay-300"
      )}
    >
      {/* Header */}
      <div className="mb-2">
        <h3 className="font-display text-base font-semibold text-earth-900 leading-tight">
          {suggestion.title}
        </h3>
        <p className="mt-1 text-sm text-earth-600 leading-relaxed line-clamp-3">
          {suggestion.description}
        </p>
      </div>

      {/* Tags */}
      {suggestion.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {suggestion.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-clay-100 px-2.5 py-0.5 text-xs font-medium text-clay-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Parameters */}
      {paramEntries.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-x-3 gap-y-1.5 rounded-lg bg-earth-50 px-3 py-2">
          {paramEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-earth-400">
                {PARAM_LABELS[key] ?? key}
              </span>
              <span className="text-xs font-semibold text-earth-800">
                {typeof value === "number" ? `${value} cm` : value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Glaze suggestions collapsible */}
      {suggestion.thumbnailPrompt && (
        <button
          type="button"
          onClick={() => setGlazeOpen((v) => !v)}
          className="mb-2 flex w-full items-center gap-1.5 text-xs font-medium text-earth-500 hover:text-clay-600 transition-colors"
        >
          <Palette size={12} />
          <span>Glaze suggestions</span>
          <ChevronRight
            size={12}
            className={cn("ml-auto transition-transform", glazeOpen && "rotate-90")}
          />
        </button>
      )}

      {glazeOpen && suggestion.thumbnailPrompt && (
        <div className="mb-3 rounded-lg bg-kiln-50 border border-kiln-100 p-2.5">
          <p className="text-xs text-kiln-800 leading-relaxed italic">
            &ldquo;{suggestion.thumbnailPrompt}&rdquo;
          </p>
        </div>
      )}

      {/* Apply button */}
      <button
        type="button"
        onClick={() => onApply(suggestion)}
        className={cn(
          "w-full rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isApplied
            ? "bg-clay-100 text-clay-700 cursor-default"
            : "bg-clay-500 text-white hover:bg-clay-600 active:scale-[0.98]"
        )}
        disabled={isApplied}
      >
        {isApplied ? "Applied to canvas" : "Apply to canvas"}
      </button>
    </div>
  );
}
