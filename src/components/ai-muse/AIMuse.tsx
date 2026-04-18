"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import type { AIFormSuggestion, AIMuse, ModelingMode } from "@/types";
import { getMuseSuggestions, refineWithNaturalLanguage, getTodaysDailyPrompt, getRandomDailyPrompt } from "@/lib/ai/museClient";
import { CERAMIC_STYLES } from "@/lib/ai/styleTransfer";
import { DailyPromptBanner } from "./DailyPromptBanner";
import { SuggestionCard } from "./SuggestionCard";
import { StyleCard } from "./StyleCard";
import { RefineInput } from "./RefineInput";
import type { CeramicStyle } from "@/lib/ai/styleTransfer";

const MODE_LABELS: Record<ModelingMode, string> = {
  wheel: "Wheel",
  handbuilding: "Handbuilding",
  sculpting: "Sculpting",
  tile: "Tile",
  jewelry: "Jewelry",
  mixed: "Mixed",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-earth-200 p-4 space-y-3">
          <div className="h-4 w-3/4 rounded bg-earth-100" />
          <div className="h-3 w-full rounded bg-earth-100" />
          <div className="h-3 w-5/6 rounded bg-earth-100" />
          <div className="flex gap-1.5 mt-2">
            <div className="h-5 w-16 rounded-full bg-clay-100" />
            <div className="h-5 w-12 rounded-full bg-clay-100" />
            <div className="h-5 w-20 rounded-full bg-clay-100" />
          </div>
          <div className="h-8 w-full rounded-lg bg-earth-100 mt-3" />
        </div>
      ))}
    </div>
  );
}

export function AIMuse() {
  const { aiMuseOpen, toggleAIMuse, canvasView } = useStudioStore();
  const currentMode = canvasView.mode;

  // Daily prompt state
  const [dailyPrompt, setDailyPrompt] = useState<string>(() => getTodaysDailyPrompt());

  // Generate form state
  const [promptText, setPromptText] = useState("");
  const [selectedMode, setSelectedMode] = useState<ModelingMode>(currentMode);
  const [selectedStyle, setSelectedStyle] = useState<CeramicStyle | null>(null);

  // Results state
  const [suggestions, setSuggestions] = useState<AIFormSuggestion[]>([]);
  const [styleNotes, setStyleNotes] = useState("");
  const [technicalNotes, setTechnicalNotes] = useState("");
  const [glazeSuggestions, setGlazeSuggestions] = useState<string[]>([]);
  const [appliedSuggestion, setAppliedSuggestion] = useState<AIFormSuggestion | null>(null);

  // Loading / error
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Refine state
  const [refineExplanation, setRefineExplanation] = useState<string | undefined>(undefined);
  const [isRefining, setIsRefining] = useState(false);

  // Sync mode when studio mode changes
  useEffect(() => {
    setSelectedMode(currentMode);
  }, [currentMode]);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    const trimmed = promptText.trim();
    if (!trimmed || isGenerating) return;

    setIsGenerating(true);
    setGenerateError(null);
    setSuggestions([]);
    setStyleNotes("");
    setTechnicalNotes("");
    setGlazeSuggestions([]);
    setAppliedSuggestion(null);
    setRefineExplanation(undefined);

    const input: AIMuse = {
      prompt: trimmed,
      mode: selectedMode,
      style: selectedStyle?.name,
    };

    try {
      const response = await getMuseSuggestions(input);
      setSuggestions(response.suggestions);
      setStyleNotes(response.styleNotes);
      setTechnicalNotes(response.technicalNotes);
      setGlazeSuggestions(response.glazeSuggestions);

      // Scroll results into view
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Muse couldn't connect. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [promptText, selectedMode, selectedStyle, isGenerating]);

  const handleApplySuggestion = useCallback((suggestion: AIFormSuggestion) => {
    setAppliedSuggestion(suggestion);
    setRefineExplanation(undefined);
    // In a real integration this would call into the 3D canvas store
    // For now we mark it applied so the Refine input becomes active
  }, []);

  const handleRefine = useCallback(
    async (instruction: string) => {
      if (!appliedSuggestion) return;
      setIsRefining(true);
      setRefineExplanation(undefined);

      const currentParams = appliedSuggestion.parameters as Record<string, number | string>;
      try {
        const result = await refineWithNaturalLanguage(instruction, currentParams);
        // Merge param changes into the applied suggestion
        const merged: AIFormSuggestion = {
          ...appliedSuggestion,
          parameters: { ...currentParams, ...result.parameterChanges },
        };
        setAppliedSuggestion(merged);
        setRefineExplanation(result.explanation);
        // Also update the suggestion in the list
        setSuggestions((prev) =>
          prev.map((s) => (s.title === appliedSuggestion.title ? merged : s))
        );
      } catch (err) {
        setRefineExplanation(
          err instanceof Error ? err.message : "Muse couldn't process that. Please try again."
        );
      } finally {
        setIsRefining(false);
      }
    },
    [appliedSuggestion]
  );

  const handleGetInspired = useCallback((prompt: string) => {
    setPromptText(prompt);
  }, []);

  const handleNewPrompt = useCallback(() => {
    const newPrompt = getRandomDailyPrompt();
    setDailyPrompt(newPrompt);
  }, []);

  const handleStyleSelect = useCallback((style: CeramicStyle) => {
    setSelectedStyle((prev) => (prev?.id === style.id ? null : style));
  }, []);

  return (
    <AnimatePresence>
      {aiMuseOpen && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleAIMuse}
            className="fixed inset-0 z-40 bg-earth-950/40 backdrop-blur-sm md:hidden"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full flex-col bg-clay-50",
              "border-l border-earth-200 shadow-clay-lg",
              "w-full md:w-[380px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-earth-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay-500">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-semibold text-earth-900">AI Muse</h2>
                  <p className="text-[11px] text-earth-400">Creative companion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAIMuse}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-earth-400 hover:bg-earth-100 hover:text-earth-700 transition-colors"
                aria-label="Close AI Muse"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">

              {/* ── 1. Daily Prompt ── */}
              <section>
                <DailyPromptBanner
                  prompt={dailyPrompt}
                  onGetInspired={handleGetInspired}
                  onNewPrompt={handleNewPrompt}
                />
              </section>

              {/* ── 2. Generate Form ── */}
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-earth-400">
                  Generate form
                </p>

                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe what you want to create…"
                  rows={3}
                  className={cn(
                    "w-full resize-none rounded-xl border border-earth-200 bg-white px-3 py-2.5",
                    "text-sm text-earth-800 placeholder:text-earth-300 leading-relaxed",
                    "focus:outline-none focus:ring-2 focus:ring-clay-300 focus:border-clay-400",
                    "hover:border-clay-300 transition-colors"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                  }}
                />

                {/* Mode selector */}
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(MODE_LABELS) as ModelingMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                        selectedMode === mode
                          ? "bg-clay-500 text-white"
                          : "bg-white border border-earth-200 text-earth-600 hover:border-clay-300 hover:text-earth-900"
                      )}
                    >
                      {MODE_LABELS[mode]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!promptText.trim() || isGenerating}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                    !promptText.trim() || isGenerating
                      ? "bg-earth-100 text-earth-400 cursor-not-allowed"
                      : "bg-clay-500 text-white hover:bg-clay-600 active:scale-[0.98]"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Muse is thinking…
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate
                    </>
                  )}
                </button>

                {generateError && (
                  <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    {generateError}
                  </p>
                )}
              </section>

              {/* ── 3. Style Transfer ── */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-earth-400">
                    Style influence
                  </p>
                  {selectedStyle && (
                    <button
                      type="button"
                      onClick={() => setSelectedStyle(null)}
                      className="text-[11px] text-earth-400 hover:text-clay-600 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {selectedStyle && (
                  <div className="rounded-lg border border-clay-200 bg-clay-50 px-3 py-2 text-xs text-clay-700">
                    <span className="font-semibold">{selectedStyle.name}</span>
                    {" "}will influence the next generation.
                  </div>
                )}

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {CERAMIC_STYLES.map((style) => (
                    <StyleCard
                      key={style.id}
                      style={style}
                      isSelected={selectedStyle?.id === style.id}
                      onSelect={handleStyleSelect}
                    />
                  ))}
                </div>
              </section>

              {/* ── 4. Results ── */}
              {(isGenerating || suggestions.length > 0) && (
                <section ref={resultsRef} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-earth-400">
                    Suggestions
                  </p>

                  {isGenerating ? (
                    <LoadingSkeleton />
                  ) : (
                    <>
                      <div className="space-y-3">
                        {suggestions.map((suggestion, i) => (
                          <SuggestionCard
                            key={`${suggestion.title}-${i}`}
                            suggestion={suggestion}
                            onApply={handleApplySuggestion}
                            isApplied={appliedSuggestion?.title === suggestion.title}
                          />
                        ))}
                      </div>

                      {/* Style / technical notes */}
                      {(styleNotes || technicalNotes || glazeSuggestions.length > 0) && (
                        <div className="space-y-2 rounded-xl border border-earth-200 bg-white p-3">
                          {styleNotes && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-400 mb-0.5">
                                Style direction
                              </p>
                              <p className="text-xs leading-relaxed text-earth-700">{styleNotes}</p>
                            </div>
                          )}
                          {technicalNotes && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-400 mb-0.5">
                                Technical notes
                              </p>
                              <p className="text-xs leading-relaxed text-earth-700">{technicalNotes}</p>
                            </div>
                          )}
                          {glazeSuggestions.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-earth-400 mb-1">
                                Glaze ideas
                              </p>
                              <ul className="space-y-0.5">
                                {glazeSuggestions.map((g, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-xs text-earth-700">
                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kiln-400" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* ── 5. Refine ── */}
              {(appliedSuggestion || suggestions.length > 0) && !isGenerating && (
                <section className="pb-4">
                  <div className="rounded-xl border border-earth-200 bg-white p-4">
                    <RefineInput
                      onApply={handleRefine}
                      explanation={refineExplanation}
                      isLoading={isRefining}
                      disabled={!appliedSuggestion}
                    />
                  </div>
                </section>
              )}

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
