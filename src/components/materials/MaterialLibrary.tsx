"use client";

import { useState, useMemo } from "react";
import type { ClayBody, ClayBodyType } from "@/types";
import { CLAY_BODIES } from "@/lib/materials/clayBodies";
import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<ClayBodyType, string> = {
  porcelain: "Porcelain",
  stoneware: "Stoneware",
  earthenware: "Earthenware",
  paper_clay: "Paper Clay",
  air_dry: "Air-Dry",
  polymer: "Polymer",
  printable: "3D Printable",
  terracotta: "Terracotta",
  raku: "Raku",
};

const TYPE_BADGE_COLORS: Record<ClayBodyType, string> = {
  porcelain: "bg-slate-100 text-slate-700",
  stoneware: "bg-amber-100 text-amber-800",
  earthenware: "bg-orange-100 text-orange-800",
  paper_clay: "bg-lime-100 text-lime-800",
  air_dry: "bg-sky-100 text-sky-700",
  polymer: "bg-purple-100 text-purple-700",
  printable: "bg-cyan-100 text-cyan-800",
  terracotta: "bg-red-100 text-red-800",
  raku: "bg-yellow-100 text-yellow-800",
};

function coneLabel(min: number, max: number): string {
  if (min === 0 && max === 0) return "No fire";
  if (min === max) return `^${min > 0 ? min : min}`;
  return `^${min > 0 ? min : min}–^${max > 0 ? max : max}`;
}

interface ClayCardProps {
  body: ClayBody;
  isSelected: boolean;
  onSelect: (body: ClayBody) => void;
}

function ClayCard({ body, isSelected, onSelect }: ClayCardProps) {
  return (
    <button
      onClick={() => onSelect(body)}
      className={cn(
        "group w-full text-left rounded-lg border transition-all duration-150 overflow-hidden",
        "bg-white hover:shadow-clay-md focus-visible:ring-2 focus-visible:ring-clay-500",
        isSelected
          ? "border-clay-500 shadow-clay-md ring-2 ring-clay-500"
          : "border-earth-200 hover:border-clay-300"
      )}
    >
      {/* Colour swatches */}
      <div className="flex h-10">
        <div
          className="w-1/2 transition-transform duration-150 group-hover:scale-y-110"
          style={{ backgroundColor: body.color }}
          title={`Raw: ${body.color}`}
        />
        <div
          className="w-1/2"
          style={{ backgroundColor: body.firedColor }}
          title={`Fired: ${body.firedColor}`}
        />
      </div>

      {/* Labels */}
      <div className="px-3 py-2 space-y-1">
        <p className="text-sm font-semibold text-earth-900 leading-tight line-clamp-1">
          {body.name}
        </p>

        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span
            className={cn(
              "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
              TYPE_BADGE_COLORS[body.type]
            )}
          >
            {TYPE_LABELS[body.type]}
          </span>
          <span className="text-[11px] text-earth-500">{coneLabel(body.coneMin, body.coneMax)}</span>
        </div>

        <p className="text-[11px] text-earth-600">
          Shrinkage: <span className="font-medium text-earth-800">{body.shrinkageRate}%</span>
        </p>
      </div>
    </button>
  );
}

const ALL_TYPES: (ClayBodyType | "all")[] = [
  "all",
  "porcelain",
  "stoneware",
  "earthenware",
  "terracotta",
  "raku",
  "paper_clay",
  "air_dry",
  "polymer",
  "printable",
];

interface PropertyRowProps {
  label: string;
  value: React.ReactNode;
}

function PropertyRow({ label, value }: PropertyRowProps) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-earth-100 last:border-b-0">
      <span className="text-xs text-earth-500 min-w-[110px]">{label}</span>
      <span className="text-xs font-medium text-earth-800 text-right">{value}</span>
    </div>
  );
}

function BarMeter({ value, max = 1, color = "bg-clay-500" }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-earth-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-earth-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

export function MaterialLibrary() {
  const selectedClayBody = useStudioStore((s) => s.selectedClayBody);
  const setSelectedClayBody = useStudioStore((s) => s.setSelectedClayBody);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ClayBodyType | "all">("all");

  const filtered = useMemo(() => {
    return CLAY_BODIES.filter((b) => {
      const matchesType = filterType === "all" || b.type === filterType;
      const matchesSearch =
        search.trim() === "" ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [search, filterType]);

  const handleSelect = (body: ClayBody) => {
    if (selectedClayBody?.id === body.id) {
      setSelectedClayBody(null);
    } else {
      setSelectedClayBody(body);
    }
  };

  return (
    <div className="flex flex-col h-full bg-clay-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-earth-200">
        <h2 className="font-display text-lg font-semibold text-earth-900">Clay Bodies</h2>
        <p className="text-xs text-earth-500 mt-0.5">{CLAY_BODIES.length} materials available</p>

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
            placeholder="Search clay bodies…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-earth-200 rounded-md bg-white text-earth-800 placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-clay-400"
          />
        </div>
      </div>

      {/* Type filters */}
      <div className="px-4 py-2 flex gap-1.5 flex-wrap border-b border-earth-100">
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              filterType === t
                ? "bg-clay-500 text-white"
                : "bg-earth-100 text-earth-600 hover:bg-earth-200"
            )}
          >
            {t === "all" ? "All" : TYPE_LABELS[t as ClayBodyType]}
          </button>
        ))}
      </div>

      {/* Grid + Detail split */}
      <div className="flex flex-1 min-h-0">
        {/* Grid */}
        <div
          className={cn(
            "overflow-y-auto p-3 transition-all duration-200",
            selectedClayBody ? "w-1/2" : "w-full"
          )}
        >
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-earth-400 text-sm">
              No clay bodies match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((body) => (
                <ClayCard
                  key={body.id}
                  body={body}
                  isSelected={selectedClayBody?.id === body.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedClayBody && (
          <div className="w-1/2 border-l border-earth-200 overflow-y-auto bg-white">
            <div className="p-4 space-y-4">
              {/* Colour swatches */}
              <div className="flex gap-2">
                <div className="flex-1 rounded-md overflow-hidden h-14 flex flex-col">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: selectedClayBody.color }}
                  />
                  <p className="text-[10px] text-center bg-earth-50 text-earth-500 py-0.5">Raw</p>
                </div>
                <div className="flex-1 rounded-md overflow-hidden h-14 flex flex-col">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: selectedClayBody.firedColor }}
                  />
                  <p className="text-[10px] text-center bg-earth-50 text-earth-500 py-0.5">Fired</p>
                </div>
              </div>

              {/* Name + badge */}
              <div>
                <h3 className="font-display font-semibold text-base text-earth-900">
                  {selectedClayBody.name}
                </h3>
                <span
                  className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium",
                    TYPE_BADGE_COLORS[selectedClayBody.type]
                  )}
                >
                  {TYPE_LABELS[selectedClayBody.type]}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-earth-600 leading-relaxed">
                {selectedClayBody.description}
              </p>

              {/* Properties */}
              <div className="bg-clay-50 rounded-md px-3 py-2">
                <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider mb-2">
                  Properties
                </p>
                <PropertyRow
                  label="Cone Range"
                  value={coneLabel(selectedClayBody.coneMin, selectedClayBody.coneMax)}
                />
                <PropertyRow
                  label="Firing Temp"
                  value={
                    selectedClayBody.firingTempMax > 0
                      ? `${selectedClayBody.firingTempMin}–${selectedClayBody.firingTempMax}°C`
                      : "No kiln required"
                  }
                />
                <PropertyRow
                  label="Shrinkage"
                  value={`${selectedClayBody.shrinkageRate}%`}
                />

                <div className="py-1.5 border-b border-earth-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-earth-500">Plasticity</span>
                    <span className="text-xs font-medium text-earth-800">
                      {(selectedClayBody.plasticity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <BarMeter value={selectedClayBody.plasticity} max={1} color="bg-clay-500" />
                </div>

                <div className="py-1.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-earth-500">Grog Content</span>
                    <span className="text-xs font-medium text-earth-800">
                      {(selectedClayBody.grogContent * 100).toFixed(0)}%
                    </span>
                  </div>
                  <BarMeter value={selectedClayBody.grogContent} max={1} color="bg-earth-400" />
                </div>

                {/* Extra properties */}
                {Object.entries(selectedClayBody.properties).map(([key, val]) => (
                  <PropertyRow
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    value={typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                  />
                ))}
              </div>

              {/* Deselect */}
              <button
                onClick={() => setSelectedClayBody(null)}
                className="w-full py-1.5 text-xs text-earth-500 hover:text-earth-700 transition-colors"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
