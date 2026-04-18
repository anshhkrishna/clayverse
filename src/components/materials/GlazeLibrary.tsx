"use client";

import { useState, useMemo } from "react";
import type { FiringAtmosphere, GlazeRecipe, GlazeSurface } from "@/types";
import { GLAZE_LIBRARY } from "@/lib/materials/glazes";
import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";

const SURFACE_LABELS: Record<GlazeSurface, string> = {
  matte: "Matte",
  satin: "Satin",
  glossy: "Glossy",
  crystalline: "Crystalline",
  textured: "Textured",
  metallic: "Metallic",
};

const SURFACE_BADGE: Record<GlazeSurface, string> = {
  matte: "bg-stone-100 text-stone-700",
  satin: "bg-amber-50 text-amber-700",
  glossy: "bg-sky-100 text-sky-700",
  crystalline: "bg-cyan-100 text-cyan-700",
  textured: "bg-orange-100 text-orange-700",
  metallic: "bg-gray-200 text-gray-700",
};

const ATMOSPHERE_LABELS: Record<FiringAtmosphere, string> = {
  oxidation: "Oxidation",
  reduction: "Reduction",
  neutral: "Neutral",
  soda: "Soda",
  wood: "Wood",
  pit: "Pit",
  saggar: "Saggar",
};

const MAX_GLAZES = 3;

function coneLabel(min: number, max: number): string {
  if (min === 0 && max === 0) return "No fire";
  if (min === max) return `^${min}`;
  return `^${min}–^${max}`;
}

interface GlazeSwatchProps {
  glaze: GlazeRecipe;
  isSelected: boolean;
  isAtLimit: boolean;
  onToggle: (glaze: GlazeRecipe) => void;
  onDetail: (glaze: GlazeRecipe) => void;
}

function GlazeSwatch({ glaze, isSelected, isAtLimit, onToggle, onDetail }: GlazeSwatchProps) {
  return (
    <div
      className={cn(
        "group rounded-lg border overflow-hidden transition-all duration-150 bg-white",
        isSelected
          ? "border-clay-500 ring-2 ring-clay-500 shadow-clay"
          : "border-earth-200 hover:border-clay-300 hover:shadow-clay"
      )}
    >
      {/* Circular colour preview */}
      <button
        onClick={() => onDetail(glaze)}
        className="block w-full pt-3 px-3 focus:outline-none"
        aria-label={`Details for ${glaze.name}`}
      >
        <div className="flex justify-center">
          <div
            className="w-12 h-12 rounded-full border-2 border-white shadow-md transition-transform duration-150 group-hover:scale-105"
            style={{ backgroundColor: glaze.colorHex }}
          />
        </div>
      </button>

      {/* Info */}
      <div className="px-2.5 pb-2 pt-2 text-center space-y-1">
        <p className="text-[11px] font-semibold text-earth-900 leading-tight line-clamp-1">
          {glaze.name}
        </p>
        <p className="text-[10px] text-earth-500">{coneLabel(glaze.coneMin, glaze.coneMax)}</p>
        <span
          className={cn(
            "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
            SURFACE_BADGE[glaze.surface]
          )}
        >
          {SURFACE_LABELS[glaze.surface]}
        </span>
      </div>

      {/* Add / Applied button */}
      <div className="px-2 pb-2.5">
        <button
          onClick={() => onToggle(glaze)}
          disabled={!isSelected && isAtLimit}
          className={cn(
            "w-full py-1 rounded text-[11px] font-medium transition-colors",
            isSelected
              ? "bg-clay-500 text-white hover:bg-clay-600"
              : isAtLimit
              ? "bg-earth-100 text-earth-400 cursor-not-allowed"
              : "bg-earth-100 text-earth-700 hover:bg-clay-100 hover:text-clay-700"
          )}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Applied
            </span>
          ) : isAtLimit ? (
            "Limit reached"
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </div>
  );
}

const ALL_SURFACES: (GlazeSurface | "all")[] = [
  "all",
  "matte",
  "satin",
  "glossy",
  "crystalline",
  "textured",
  "metallic",
];

const CONE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "All cones", min: -99, max: 99 },
  { label: "Low fire (^06–^2)", min: -6, max: 2 },
  { label: "Mid fire (^4–^7)", min: 4, max: 7 },
  { label: "High fire (^8–^12)", min: 8, max: 12 },
];

interface DetailPanelProps {
  glaze: GlazeRecipe;
  isSelected: boolean;
  isAtLimit: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function DetailPanel({ glaze, isSelected, isAtLimit, onToggle, onClose }: DetailPanelProps) {
  return (
    <div className="border-l border-earth-200 bg-white overflow-y-auto w-64 flex-shrink-0">
      <div className="p-4 space-y-4">
        {/* Close */}
        <div className="flex items-start justify-between">
          <h3 className="font-display font-semibold text-sm text-earth-900 leading-tight">
            {glaze.name}
          </h3>
          <button
            onClick={onClose}
            className="text-earth-400 hover:text-earth-600 ml-2 flex-shrink-0"
            aria-label="Close detail"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Colour circle */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full border-4 border-earth-100 shadow-clay-md"
            style={{ backgroundColor: glaze.colorHex }}
          />
        </div>

        {/* Surface + cone */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium",
              SURFACE_BADGE[glaze.surface]
            )}
          >
            {SURFACE_LABELS[glaze.surface]}
          </span>
          <span className="text-xs text-earth-500">
            {coneLabel(glaze.coneMin, glaze.coneMax)}
          </span>
        </div>

        {/* Atmospheres */}
        <div>
          <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
            Compatible Atmospheres
          </p>
          <div className="flex flex-wrap gap-1">
            {glaze.compatibleAtmospheres.map((a) => (
              <span
                key={a}
                className="px-1.5 py-0.5 bg-kiln-50 text-kiln-700 rounded text-[10px] font-medium"
              >
                {ATMOSPHERE_LABELS[a]}
              </span>
            ))}
          </div>
        </div>

        {/* Effects */}
        {glaze.effects.filter((e) => e !== "none").length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
              Effects
            </p>
            <div className="flex flex-wrap gap-1">
              {glaze.effects
                .filter((e) => e !== "none")
                .map((e) => (
                  <span
                    key={e}
                    className="px-1.5 py-0.5 bg-sage-50 text-sage-700 rounded text-[10px] capitalize"
                  >
                    {e.replace(/_/g, " ")}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div>
          <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
            Recipe
          </p>
          <div className="space-y-1">
            {glaze.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-[11px] text-earth-700 leading-tight">{ing.material}</div>
                  <div className="mt-0.5 h-1 bg-earth-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-clay-400 rounded-full"
                      style={{ width: `${ing.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-earth-600 w-8 text-right">
                  {ing.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {glaze.notes && (
          <div className="bg-clay-50 rounded-md p-2.5">
            <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-[11px] text-earth-600 leading-relaxed">{glaze.notes}</p>
          </div>
        )}

        {/* Apply button */}
        <button
          onClick={onToggle}
          disabled={!isSelected && isAtLimit}
          className={cn(
            "w-full py-2 rounded-md text-sm font-medium transition-colors",
            isSelected
              ? "bg-clay-500 text-white hover:bg-clay-600"
              : isAtLimit
              ? "bg-earth-100 text-earth-400 cursor-not-allowed"
              : "bg-clay-100 text-clay-800 hover:bg-clay-200"
          )}
        >
          {isSelected ? "Remove Glaze" : isAtLimit ? `Max ${MAX_GLAZES} glazes` : "Apply Glaze"}
        </button>
      </div>
    </div>
  );
}

export function GlazeLibrary() {
  const selectedGlazeRecipes = useStudioStore((s) => s.selectedGlazeRecipes);
  const addGlaze = useStudioStore((s) => s.addGlaze);
  const removeGlaze = useStudioStore((s) => s.removeGlaze);

  const [search, setSearch] = useState("");
  const [filterSurface, setFilterSurface] = useState<GlazeSurface | "all">("all");
  const [filterConeRange, setFilterConeRange] = useState(0);
  const [filterAtmosphere, setFilterAtmosphere] = useState<FiringAtmosphere | "all">("all");
  const [detailGlaze, setDetailGlaze] = useState<GlazeRecipe | null>(null);

  const isAtLimit = selectedGlazeRecipes.length >= MAX_GLAZES;

  const coneRange = CONE_RANGES[filterConeRange];

  const filtered = useMemo(() => {
    return GLAZE_LIBRARY.filter((g) => {
      const matchesSurface = filterSurface === "all" || g.surface === filterSurface;
      const matchesCone =
        coneRange.min === -99 ||
        (g.coneMin <= coneRange.max && g.coneMax >= coneRange.min);
      const matchesAtmosphere =
        filterAtmosphere === "all" || g.compatibleAtmospheres.includes(filterAtmosphere);
      const matchesSearch =
        search.trim() === "" ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.notes.toLowerCase().includes(search.toLowerCase());
      return matchesSurface && matchesCone && matchesAtmosphere && matchesSearch;
    });
  }, [search, filterSurface, filterConeRange, filterAtmosphere, coneRange]);

  const handleToggle = (glaze: GlazeRecipe) => {
    const isSelected = selectedGlazeRecipes.some((g) => g.id === glaze.id);
    if (isSelected) {
      removeGlaze(glaze.id);
    } else if (!isAtLimit) {
      addGlaze(glaze);
    }
  };

  return (
    <div className="flex flex-col h-full bg-clay-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-earth-200">
        <h2 className="font-display text-lg font-semibold text-earth-900">Glaze Library</h2>
        <p className="text-xs text-earth-500 mt-0.5">
          {GLAZE_LIBRARY.length} glazes — {selectedGlazeRecipes.length}/{MAX_GLAZES} applied
        </p>

        {/* Search */}
        <div className="mt-3 relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-earth-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search glazes…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-earth-200 rounded-md bg-white text-earth-800 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-clay-400"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-earth-100 space-y-2">
        {/* Surface */}
        <div className="flex gap-1 flex-wrap">
          {ALL_SURFACES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSurface(s)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors",
                filterSurface === s
                  ? "bg-clay-500 text-white"
                  : "bg-earth-100 text-earth-600 hover:bg-earth-200"
              )}
            >
              {s === "all" ? "All surfaces" : SURFACE_LABELS[s as GlazeSurface]}
            </button>
          ))}
        </div>

        {/* Cone range + atmosphere */}
        <div className="flex gap-2">
          <select
            value={filterConeRange}
            onChange={(e) => setFilterConeRange(Number(e.target.value))}
            className="flex-1 text-[11px] border border-earth-200 rounded-md px-2 py-1 bg-white text-earth-700 focus:outline-none focus:ring-2 focus:ring-clay-400"
          >
            {CONE_RANGES.map((r, i) => (
              <option key={i} value={i}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={filterAtmosphere}
            onChange={(e) => setFilterAtmosphere(e.target.value as FiringAtmosphere | "all")}
            className="flex-1 text-[11px] border border-earth-200 rounded-md px-2 py-1 bg-white text-earth-700 focus:outline-none focus:ring-2 focus:ring-clay-400"
          >
            <option value="all">All atmospheres</option>
            {(Object.keys(ATMOSPHERE_LABELS) as FiringAtmosphere[]).map((a) => (
              <option key={a} value={a}>
                {ATMOSPHERE_LABELS[a]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applied glazes strip */}
      {selectedGlazeRecipes.length > 0 && (
        <div className="px-4 py-2 bg-clay-100 border-b border-clay-200 flex gap-2 flex-wrap items-center">
          <span className="text-[10px] font-semibold text-clay-700 uppercase tracking-wider">Applied:</span>
          {selectedGlazeRecipes.map((g) => (
            <button
              key={g.id}
              onClick={() => removeGlaze(g.id)}
              className="flex items-center gap-1 px-2 py-0.5 bg-white border border-clay-300 rounded-full text-[11px] text-clay-800 hover:bg-clay-50 transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: g.colorHex }}
              />
              {g.name}
              <svg className="w-2.5 h-2.5 text-clay-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-earth-400 text-sm">
              No glazes match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((glaze) => {
                const isSelected = selectedGlazeRecipes.some((g) => g.id === glaze.id);
                return (
                  <GlazeSwatch
                    key={glaze.id}
                    glaze={glaze}
                    isSelected={isSelected}
                    isAtLimit={isAtLimit}
                    onToggle={handleToggle}
                    onDetail={setDetailGlaze}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detailGlaze && (
          <DetailPanel
            glaze={detailGlaze}
            isSelected={selectedGlazeRecipes.some((g) => g.id === detailGlaze.id)}
            isAtLimit={isAtLimit}
            onToggle={() => handleToggle(detailGlaze)}
            onClose={() => setDetailGlaze(null)}
          />
        )}
      </div>
    </div>
  );
}
