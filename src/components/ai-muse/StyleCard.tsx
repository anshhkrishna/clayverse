"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CeramicStyle } from "@/lib/ai/styleTransfer";

interface StyleCardProps {
  style: CeramicStyle;
  isSelected: boolean;
  onSelect: (style: CeramicStyle) => void;
}

export function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(style)}
      className={cn(
        "relative flex-shrink-0 w-36 rounded-xl border p-3 text-left transition-all",
        "hover:shadow-md active:scale-[0.97]",
        isSelected
          ? "border-clay-500 bg-clay-50 shadow-[0_0_0_2px_var(--color-clay-200)]"
          : "border-earth-200 bg-white hover:border-clay-300"
      )}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-clay-500 text-white">
          <Check size={11} strokeWidth={3} />
        </div>
      )}

      {/* Color palette swatches */}
      <div className="mb-2.5 flex gap-1">
        {style.colorPalette.slice(0, 5).map((hex, i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full border border-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>

      {/* Name */}
      <p className="text-xs font-semibold leading-tight text-earth-900 line-clamp-2">
        {style.name}
      </p>

      {/* Origin & era */}
      <p className="mt-0.5 text-[10px] text-earth-500 line-clamp-1">{style.origin}</p>
      <p className="text-[10px] text-earth-400 line-clamp-1">{style.era}</p>

      {/* Brief description */}
      <p className="mt-1.5 text-[10px] leading-snug text-earth-600 line-clamp-2">
        {style.description.split("—")[0].trim()}
      </p>
    </button>
  );
}
