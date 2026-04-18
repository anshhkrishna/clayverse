"use client";

import { useState } from "react";
import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";
import { WarningBadge } from "./WarningBadge";
import { FiringScheduleTable } from "./FiringScheduleTable";
import { calculateShrinkage, estimateFinalDimensions } from "@/lib/physics/shrinkageEngine";
import { analyzeWallThickness } from "@/lib/physics/wallThicknessAnalyzer";
import { simulateStructure } from "@/lib/physics/structuralSimulator";
import { simulateGlaze, toGlazePreviewResult } from "@/lib/physics/glazeSimulator";
import { predictFiring } from "@/lib/physics/firingPredictor";
import { calculateSustainability } from "@/lib/physics/sustainabilityCalculator";
import type { FiringAtmosphere, SimulationResult, SimulationWarning } from "@/types";
import { generateId } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

type RiskLevel = "low" | "medium" | "high";

const RISK_BADGE: Record<RiskLevel, string> = {
  low: "bg-sage-100 text-sage-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

function RiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-earth-600">{label}</span>
      <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize", RISK_BADGE[level])}>
        {level}
      </span>
    </div>
  );
}

/** Circular score gauge rendered with SVG. */
function ScoreGauge({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - score / 100);

  const color =
    score >= 70 ? "#5c8350" : score >= 45 ? "#ff9b33" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        {/* Background ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#e8e3d9"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Score text */}
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill={color}
          fontFamily="inherit"
        >
          {Math.round(score)}
        </text>
      </svg>
      <p className="text-xs text-earth-500">/ 100</p>
    </div>
  );
}

/** Arrow diagram showing wet → fired dimension reduction. */
function DimensionArrow({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-earth-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-earth-800 w-14 text-right">
          {before.toFixed(1)} cm
        </span>
        <svg className="w-8 h-4 text-clay-400" viewBox="0 0 32 16" fill="none">
          <line x1="2" y1="8" x2="26" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <polyline points="22,4 28,8 22,12" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-xs font-semibold text-clay-700 w-14">
          {after.toFixed(1)} cm
        </span>
      </div>
    </div>
  );
}

/** Thickness gradient bar */
function ThicknessBar({
  min,
  avg,
  max,
}: {
  min: number;
  avg: number;
  max: number;
}) {
  const total = max || 1;
  const minPct = (min / total) * 100;
  const avgPct = (avg / total) * 100;

  return (
    <div className="space-y-1">
      <div className="relative h-3 bg-gradient-to-r from-red-400 via-amber-400 to-sage-500 rounded-full overflow-hidden">
        {/* Min marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80"
          style={{ left: `${minPct}%` }}
          title={`Min: ${min.toFixed(1)} mm`}
        />
        {/* Avg marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-earth-900/60"
          style={{ left: `${avgPct}%` }}
          title={`Avg: ${avg.toFixed(1)} mm`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-earth-500">
        <span>Min {min.toFixed(1)} mm</span>
        <span className="font-medium text-earth-700">Avg {avg.toFixed(1)} mm</span>
        <span>Max {max.toFixed(1)} mm</span>
      </div>
    </div>
  );
}

// ── Default demo geometry used when no mesh is present ─────────────────────────
function buildDemoGeometry() {
  // A simple cylinder approximation — 20 cm tall, 10 cm diameter, ~5 mm walls
  const vertices = new Float32Array(60);
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    // Inner ring: r=0.045 m
    vertices[i * 3] = Math.cos(angle) * 0.045;
    vertices[i * 3 + 1] = i * 0.01; // 0–0.19 m height
    vertices[i * 3 + 2] = Math.sin(angle) * 0.045;
  }
  // Outer ring: r=0.05 m (5 mm wall)
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    vertices[(20 + i) * 3] = Math.cos(angle) * 0.05;
    vertices[(20 + i) * 3 + 1] = i * 0.01;
    vertices[(20 + i) * 3 + 2] = Math.sin(angle) * 0.05;
  }
  const indices = new Uint32Array(0);
  return { vertices, indices };
}

// ── Main component ─────────────────────────────────────────────────────────────

type TabKey = "shrinkage" | "walls" | "structural" | "glaze" | "firing" | "eco";

const TABS: { key: TabKey; label: string }[] = [
  { key: "shrinkage", label: "Shrinkage" },
  { key: "walls", label: "Walls" },
  { key: "structural", label: "Structure" },
  { key: "glaze", label: "Glaze" },
  { key: "firing", label: "Firing" },
  { key: "eco", label: "Eco" },
];

export function SimulationPanel() {
  const simulationPanelOpen = useStudioStore((s) => s.simulationPanelOpen);
  const selectedClayBody = useStudioStore((s) => s.selectedClayBody);
  const selectedGlazeRecipes = useStudioStore((s) => s.selectedGlazeRecipes);
  const simulationResult = useStudioStore((s) => s.simulationResult);
  const isSimulating = useStudioStore((s) => s.isSimulating);
  const setSimulationResult = useStudioStore((s) => s.setSimulationResult);
  const setIsSimulating = useStudioStore((s) => s.setIsSimulating);
  const toggleSimulationPanel = useStudioStore((s) => s.toggleSimulationPanel);

  const [activeTab, setActiveTab] = useState<TabKey>("shrinkage");

  // Extended local results (beyond SimulationResult shape)
  const [extResults, setExtResults] = useState<{
    shrinkage: ReturnType<typeof calculateShrinkage> | null;
    wallAnalysis: ReturnType<typeof analyzeWallThickness> | null;
    structural: ReturnType<typeof simulateStructure> | null;
    glazeSim: ReturnType<typeof simulateGlaze> | null;
    eco: ReturnType<typeof calculateSustainability> | null;
    atmosphere: FiringAtmosphere;
    targetCone: number;
  }>({
    shrinkage: null,
    wallAnalysis: null,
    structural: null,
    glazeSim: null,
    eco: null,
    atmosphere: "oxidation",
    targetCone: 6,
  });

  if (!simulationPanelOpen) return null;

  const canRun = !!selectedClayBody;

  const handleRun = async () => {
    if (!selectedClayBody) return;
    setIsSimulating(true);

    // Simulate async work (physics is synchronous but we want loading state)
    await new Promise((r) => setTimeout(r, 600));

    const { vertices, indices } = buildDemoGeometry();
    const targetCone = selectedClayBody.coneMax || 6;
    const atmosphere: FiringAtmosphere = "oxidation";

    // Shrinkage
    const shrinkage = calculateShrinkage(selectedClayBody, targetCone);

    // Dimensions (assume wet form: 10cm W x 20cm H x 10cm D)
    const wetW = 10, wetH = 20, wetD = 10;
    const finalDims = estimateFinalDimensions(wetW, wetH, wetD, selectedClayBody);

    // Wall analysis
    const wallAnalysis = analyzeWallThickness(vertices, indices, selectedClayBody);

    // Structural
    const structural = simulateStructure({
      vertices,
      clayBody: selectedClayBody,
      heightCm: wetH,
      baseDiameterCm: wetW,
      wallThicknessAnalysis: wallAnalysis,
    });

    // Glaze
    let glazeSim: ReturnType<typeof simulateGlaze> | null = null;
    if (selectedGlazeRecipes.length > 0) {
      glazeSim = simulateGlaze({
        glaze: selectedGlazeRecipes[0],
        clayBody: selectedClayBody,
        firingCone: targetCone,
        atmosphere,
        applicationThickness: "medium",
      });
    }

    // Firing
    const firingRec = predictFiring({
      clayBody: selectedClayBody,
      glazes: selectedGlazeRecipes,
      targetCone,
      atmosphere,
    });

    // Eco
    const eco = calculateSustainability({
      clayBody: selectedClayBody,
      estimatedWeightKg: 0.5,
      firingCone: targetCone,
      kiln: "electric",
    });

    // Collect all warnings
    const allWarnings: SimulationWarning[] = [
      ...wallAnalysis.warnings,
      ...structural.warnings,
      ...(glazeSim?.issues ?? []),
    ];

    const result: SimulationResult = {
      shrinkagePercent: shrinkage.total,
      estimatedFinalDimensions: finalDims,
      warningFlags: allWarnings,
      firingRecommendation: firingRec,
      glazePreview: glazeSim ? toGlazePreviewResult(glazeSim) : undefined,
      sustainabilityScore: eco.score,
    };

    setSimulationResult(result);
    setExtResults({
      shrinkage,
      wallAnalysis,
      structural,
      glazeSim,
      eco,
      atmosphere,
      targetCone,
    });
    setIsSimulating(false);
    setActiveTab("shrinkage");
  };

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-white border-l border-earth-200 shadow-clay-lg z-30 flex flex-col",
        "animate-slide-in-right"
      )}
      aria-label="Simulation panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-earth-200 bg-clay-50">
        <div>
          <h2 className="font-display font-semibold text-earth-900 text-sm">
            Physics Simulation
          </h2>
          {selectedClayBody && (
            <p className="text-[11px] text-earth-500 mt-0.5">{selectedClayBody.name}</p>
          )}
        </div>
        <button
          onClick={toggleSimulationPanel}
          className="text-earth-400 hover:text-earth-700 transition-colors p-1"
          aria-label="Close simulation panel"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Run button */}
      <div className="px-4 py-3 border-b border-earth-100">
        {!canRun && (
          <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-2">
            Select a clay body first to run simulation.
          </p>
        )}
        <button
          onClick={handleRun}
          disabled={!canRun || isSimulating}
          className={cn(
            "w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-150",
            canRun && !isSimulating
              ? "bg-clay-500 text-white hover:bg-clay-600 shadow-clay hover:shadow-clay-md active:scale-95"
              : "bg-earth-200 text-earth-400 cursor-not-allowed"
          )}
        >
          {isSimulating ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 010 20" />
              </svg>
              Simulating…
            </span>
          ) : (
            "Run Simulation"
          )}
        </button>
      </div>

      {/* Results */}
      {simulationResult && !isSimulating && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-earth-100 overflow-x-auto px-2 pt-1 gap-0.5 flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-2.5 py-1.5 text-[11px] font-medium rounded-t transition-colors whitespace-nowrap",
                  activeTab === tab.key
                    ? "bg-white text-clay-700 border-b-2 border-clay-500"
                    : "text-earth-500 hover:text-earth-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Shrinkage ── */}
            {activeTab === "shrinkage" && extResults.shrinkage && (
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                  Shrinkage Breakdown
                </h3>

                {/* Stage bars */}
                <div className="space-y-2">
                  {(
                    [
                      {
                        label: "Wet → Leather-hard",
                        value: extResults.shrinkage.wetToLeatherhard,
                      },
                      {
                        label: "Leather-hard → Bisque",
                        value: extResults.shrinkage.leatherhardToBisque,
                      },
                      {
                        label: "Bisque → Glaze Fired",
                        value: extResults.shrinkage.bisqueToGlazeFired,
                      },
                    ] as const
                  ).map((stage) => (
                    <div key={stage.label} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-earth-600">{stage.label}</span>
                        <span className="font-medium text-earth-800">
                          {stage.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-clay-400 rounded-full"
                          style={{ width: `${(stage.value / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="bg-clay-50 rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-earth-600">Total Shrinkage</span>
                  <span className="text-lg font-bold font-display text-clay-700">
                    {extResults.shrinkage.total.toFixed(1)}%
                  </span>
                </div>

                {/* Dimension arrows */}
                <div className="space-y-1 bg-earth-50 rounded-md p-3">
                  <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-2">
                    Estimated Final Dimensions
                  </p>
                  <DimensionArrow
                    label="Width"
                    before={10}
                    after={simulationResult.estimatedFinalDimensions.width}
                  />
                  <DimensionArrow
                    label="Height"
                    before={20}
                    after={simulationResult.estimatedFinalDimensions.height}
                  />
                  <DimensionArrow
                    label="Depth"
                    before={10}
                    after={simulationResult.estimatedFinalDimensions.depth}
                  />
                </div>

                {/* Notes */}
                <p className="text-[11px] text-earth-500 leading-relaxed">
                  {extResults.shrinkage.notes}
                </p>
              </div>
            )}

            {/* ── Wall Thickness ── */}
            {activeTab === "walls" && extResults.wallAnalysis && (
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                  Wall Thickness Analysis
                </h3>

                <ThicknessBar
                  min={extResults.wallAnalysis.minThickness}
                  avg={extResults.wallAnalysis.averageThickness}
                  max={extResults.wallAnalysis.maxThickness}
                />

                {extResults.wallAnalysis.thinSpots.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
                      Thin Spots ({extResults.wallAnalysis.thinSpots.length})
                    </p>
                    <div className="space-y-1">
                      {extResults.wallAnalysis.thinSpots.slice(0, 5).map((spot, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] bg-red-50 border border-red-100 rounded px-2 py-1"
                        >
                          <span className="text-earth-600 font-mono text-[10px]">
                            ({spot.position.map((v) => v.toFixed(3)).join(", ")})
                          </span>
                          <span className="font-semibold text-red-700">
                            {spot.thickness} mm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extResults.wallAnalysis.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    {extResults.wallAnalysis.warnings.map((w) => (
                      <WarningBadge key={w.id} warning={w} />
                    ))}
                  </div>
                )}

                {extResults.wallAnalysis.warnings.length === 0 && (
                  <div className="text-[11px] text-sage-700 bg-sage-50 border border-sage-200 rounded px-2.5 py-2">
                    Wall thickness is within acceptable range.
                  </div>
                )}
              </div>
            )}

            {/* ── Structural ── */}
            {activeTab === "structural" && extResults.structural && (
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                  Structural Analysis
                </h3>

                <div className="bg-earth-50 rounded-md px-3 py-1 divide-y divide-earth-100">
                  <RiskBadge level={extResults.structural.warpingRisk} label="Warping Risk" />
                  <RiskBadge level={extResults.structural.crackingRisk} label="Cracking Risk" />
                  <RiskBadge level={extResults.structural.slumpRisk} label="Slump Risk" />
                </div>

                {extResults.structural.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    {extResults.structural.warnings.map((w) => (
                      <WarningBadge key={w.id} warning={w} />
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
                    Recommendations
                  </p>
                  <ul className="space-y-1.5">
                    {extResults.structural.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[11px] text-earth-600 leading-relaxed"
                      >
                        <span className="text-clay-400 mt-0.5 flex-shrink-0">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ── Glaze ── */}
            {activeTab === "glaze" && (
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                  Glaze Simulation
                </h3>

                {extResults.glazeSim && simulationResult.glazePreview ? (
                  <>
                    {/* Colour result */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-full border-4 border-earth-100 shadow-clay"
                        style={{ backgroundColor: extResults.glazeSim.resultColor }}
                      />
                      <div>
                        <p className="text-xs text-earth-500">Predicted Colour</p>
                        <p className="text-sm font-semibold text-earth-800 font-mono">
                          {extResults.glazeSim.resultColor}
                        </p>
                        <p className="text-xs text-earth-600 capitalize">
                          {extResults.glazeSim.surface} surface
                        </p>
                      </div>
                    </div>

                    {/* Active effects */}
                    {extResults.glazeSim.activeEffects.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
                          Active Effects
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {extResults.glazeSim.activeEffects.map((e) => (
                            <span
                              key={e}
                              className="px-2 py-0.5 bg-kiln-50 text-kiln-700 border border-kiln-200 rounded-full text-[10px] capitalize"
                            >
                              {e.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {extResults.glazeSim.notes.length > 0 && (
                      <div className="space-y-1">
                        {extResults.glazeSim.notes.map((note, i) => (
                          <p key={i} className="text-[11px] text-earth-600 leading-relaxed">
                            {note}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Issues */}
                    {extResults.glazeSim.issues.length > 0 && (
                      <div className="space-y-1.5">
                        {extResults.glazeSim.issues.map((w) => (
                          <WarningBadge key={w.id} warning={w} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-earth-100 mx-auto mb-3" />
                    <p className="text-sm text-earth-500">No glaze applied.</p>
                    <p className="text-xs text-earth-400 mt-1">
                      Select a glaze from the Glaze Library to preview its fired result.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Firing ── */}
            {activeTab === "firing" && (
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                  Firing Recommendation
                </h3>

                <div className="bg-clay-50 rounded-md px-3 py-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-earth-500">Recommended Cone</span>
                    <span className="font-bold text-clay-700">
                      ^{simulationResult.firingRecommendation.cone}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-earth-500">Atmosphere</span>
                    <span className="font-medium text-earth-800 capitalize">
                      {simulationResult.firingRecommendation.atmosphere}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-earth-600 leading-relaxed">
                  {simulationResult.firingRecommendation.predictedOutcome}
                </p>

                {simulationResult.firingRecommendation.risks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider">
                      Risks
                    </p>
                    {simulationResult.firingRecommendation.risks.map((risk, i) => (
                      <WarningBadge
                        key={i}
                        warning={{
                          id: generateId(),
                          type: "structural_stress",
                          severity: "warning",
                          message: risk,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-2">
                    Firing Schedule
                  </p>
                  <FiringScheduleTable
                    schedule={simulationResult.firingRecommendation.schedule}
                  />
                </div>
              </div>
            )}

            {/* ── Eco ── */}
            {activeTab === "eco" && extResults.eco && (
              <div className="p-4 space-y-4">
                <h3 className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                  Sustainability Report
                </h3>

                <div className="flex items-center gap-4">
                  <ScoreGauge score={extResults.eco.score} />
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[10px] text-earth-400 uppercase tracking-wider">
                        CO₂ Estimate
                      </p>
                      <p className="text-sm font-bold text-earth-800">
                        {extResults.eco.co2EstimateKg.toFixed(2)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-earth-400 uppercase tracking-wider">
                        Energy
                      </p>
                      <p className="text-sm font-bold text-earth-800">
                        {extResults.eco.energyKwh.toFixed(2)} kWh
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
                    Suggestions
                  </p>
                  <ul className="space-y-1.5">
                    {extResults.eco.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[11px] text-earth-600 leading-relaxed"
                      >
                        <span className="text-sage-500 flex-shrink-0 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {extResults.eco.alternatives.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-earth-400 uppercase tracking-wider mb-1.5">
                      Alternatives
                    </p>
                    <div className="space-y-1.5">
                      {extResults.eco.alternatives.map((alt, i) => (
                        <div
                          key={i}
                          className="bg-sage-50 border border-sage-200 rounded-md px-2.5 py-2"
                        >
                          <p className="text-[11px] text-sage-800 font-medium">
                            {alt.description}
                          </p>
                          <p className="text-[10px] text-sage-600 mt-0.5">{alt.savings}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!simulationResult && !isSimulating && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-clay-100 flex items-center justify-center mb-3">
            <svg
              className="w-7 h-7 text-clay-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.5-1.175.295A12.072 12.072 0 018.833 20.75L7.5 21M5 14.5l1.089.272a12.072 12.072 0 003.161 7.978L7.5 21"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-earth-700">No simulation yet</p>
          <p className="text-xs text-earth-400 mt-1 leading-relaxed">
            {canRun
              ? "Hit Run Simulation to analyse your piece."
              : "Select a clay body first, then run."}
          </p>
        </div>
      )}
    </aside>
  );
}
