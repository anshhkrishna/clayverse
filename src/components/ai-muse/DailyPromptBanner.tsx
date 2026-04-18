"use client";

import { RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyPromptBannerProps {
  prompt: string;
  onGetInspired: (prompt: string) => void;
  onNewPrompt: () => void;
  className?: string;
}

export function DailyPromptBanner({
  prompt,
  onGetInspired,
  onNewPrompt,
  className,
}: DailyPromptBannerProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4",
        "bg-gradient-to-br from-clay-100 to-kiln-100",
        "border border-clay-200",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 rounded-lg bg-white/70 p-1.5">
          <Wand2 size={16} className="text-clay-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-clay-600">
            Today&rsquo;s prompt
          </p>
          <p className="text-sm font-medium leading-snug text-earth-800">{prompt}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onGetInspired(prompt)}
          className="flex-1 rounded-lg bg-clay-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-clay-600 active:scale-[0.98] transition-all"
        >
          Get inspired
        </button>
        <button
          type="button"
          onClick={onNewPrompt}
          className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-xs font-medium text-earth-600 hover:bg-white hover:text-earth-900 transition-all"
          title="Load a random prompt"
        >
          <RefreshCw size={12} />
          New
        </button>
      </div>
    </div>
  );
}
