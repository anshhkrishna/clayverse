"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefineInputProps {
  onApply: (instruction: string) => Promise<void>;
  explanation?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RefineInput({
  onApply,
  explanation,
  isLoading = false,
  disabled = false,
  className,
}: RefineInputProps) {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = instruction.trim();
    if (!trimmed || disabled || isLoading) return;
    await onApply(trimmed);
    setInstruction("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-widest text-earth-400">
        Refine with words
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={disabled || isLoading}
          placeholder="e.g. Make the rim wider, add a shoulder texture, make it taller"
          rows={3}
          className={cn(
            "w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-relaxed",
            "placeholder:text-earth-300 text-earth-800",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-clay-300",
            disabled
              ? "bg-earth-50 border-earth-200 text-earth-400 cursor-not-allowed"
              : "bg-white border-earth-200 hover:border-clay-300 focus:border-clay-400"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />

        {disabled && (
          <p className="text-xs text-earth-400 italic">
            Apply a suggestion to canvas first to enable refinement.
          </p>
        )}

        <button
          type="submit"
          disabled={!instruction.trim() || disabled || isLoading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
            !instruction.trim() || disabled || isLoading
              ? "bg-earth-100 text-earth-400 cursor-not-allowed"
              : "bg-clay-500 text-white hover:bg-clay-600 active:scale-[0.98]"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Refining…
            </>
          ) : (
            <>
              <Wand2 size={15} />
              Apply
            </>
          )}
        </button>
      </form>

      {/* Explanation of changes */}
      {explanation && (
        <div className="rounded-xl border border-sage-200 bg-sage-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-sage-600 mb-1">
            What changed
          </p>
          <p className="text-sm leading-relaxed text-sage-800">{explanation}</p>
        </div>
      )}
    </div>
  );
}
