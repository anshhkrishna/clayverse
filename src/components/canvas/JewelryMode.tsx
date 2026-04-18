"use client";

import { useState, useCallback, useEffect } from "react";
import * as THREE from "three";
import { useCanvasEngine } from "@/hooks/useCanvas";
import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";
import type { JewelryTool } from "@/types";

const JEWELRY_TOOLS: { id: JewelryTool; label: string; icon: string }[] = [
  { id: "ring_sizer", label: "Ring", icon: "◯" },
  { id: "earring_sizer", label: "Earring", icon: "◇" },
  { id: "mold_gen", label: "Mold", icon: "⬡" },
  { id: "scale", label: "Scale", icon: "⤡" },
  { id: "mirror", label: "Mirror", icon: "⇌" },
];

// US ring size to inner diameter in mm
const RING_SIZE_TO_MM: Record<number, number> = {
  1: 11.61, 2: 11.99, 3: 12.37, 4: 12.75, 5: 13.13,
  6: 13.51, 7: 13.89, 8: 14.27, 9: 14.65, 10: 15.03,
  11: 15.41, 12: 15.79, 13: 16.17, 14: 16.55, 15: 16.93,
  16: 17.31, 17: 17.69,
};

function createRingGeometry(
  innerDiameterMm: number,
  bandWidthMm: number,
  thicknessMm: number,
  segments: number = 64
): THREE.BufferGeometry {
  // Convert mm to scene units (1 unit = 1cm, so divide by 10)
  const innerRadius = innerDiameterMm / 20; // diameter/2/10
  const outerRadius = innerRadius + thicknessMm / 10;
  const bandWidth = bandWidthMm / 10;

  // Build ring using LatheGeometry with a rectangular cross-section
  const points: THREE.Vector2[] = [
    new THREE.Vector2(innerRadius, -bandWidth / 2),
    new THREE.Vector2(outerRadius, -bandWidth / 2),
    new THREE.Vector2(outerRadius, bandWidth / 2),
    new THREE.Vector2(innerRadius, bandWidth / 2),
    new THREE.Vector2(innerRadius, -bandWidth / 2),
  ];

  const geo = new THREE.LatheGeometry(points, segments);
  geo.computeVertexNormals();
  return geo;
}

function createEarringGeometry(
  widthMm: number,
  heightMm: number,
  thicknessMm: number
): THREE.BufferGeometry {
  const w = widthMm / 10;
  const h = heightMm / 10;
  const t = thicknessMm / 10;
  const geo = new THREE.BoxGeometry(w, h, t, 8, 8, 4);
  geo.computeVertexNormals();
  return geo;
}

export function JewelryMode() {
  const { setMeshGeometry } = useCanvasEngine();
  const { setActiveTool, canvasView } = useStudioStore();
  const activeTool = canvasView.activeTool as JewelryTool;

  // Ring params
  const [ringSize, setRingSize] = useState(7); // US size
  const [bandWidth, setBandWidth] = useState(8); // mm
  const [bandThickness, setBandThickness] = useState(2.5); // mm

  // Earring params
  const [earringWidth, setEarringWidth] = useState(20); // mm
  const [earringHeight, setEarringHeight] = useState(30); // mm
  const [earringThickness, setEarringThickness] = useState(3); // mm

  // Scale
  const [scaleValue, setScaleValue] = useState(1.0);
  const [isMirrored, setIsMirrored] = useState(false);

  // Auto-generate ring when params change in ring_sizer mode
  useEffect(() => {
    if (activeTool === "ring_sizer") {
      const innerDiameter = RING_SIZE_TO_MM[ringSize] ?? 14.0;
      const geo = createRingGeometry(innerDiameter, bandWidth, bandThickness);
      setMeshGeometry(geo);
    }
  }, [activeTool, ringSize, bandWidth, bandThickness, setMeshGeometry]);

  // Auto-generate earring when params change
  useEffect(() => {
    if (activeTool === "earring_sizer") {
      const geo = createEarringGeometry(earringWidth, earringHeight, earringThickness);
      setMeshGeometry(geo);
    }
  }, [activeTool, earringWidth, earringHeight, earringThickness, setMeshGeometry]);

  const handleMirrorBatch = useCallback(() => {
    setIsMirrored((v) => !v);
    // Mirror is visual — for STL export both pieces would be included
  }, []);

  const handleExportSTL = useCallback(() => {
    // For now show a placeholder — real STL export would use STLExporter
    alert("STL export: geometry is ready. Integrate STLExporter from three/examples for file download.");
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tool selector */}
      <div className="flex flex-wrap gap-1.5">
        {JEWELRY_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
              activeTool === t.id
                ? "bg-clay-500 text-white"
                : "bg-earth-800/60 text-earth-300 hover:bg-earth-700/60"
            )}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ring sizer panel */}
      {activeTool === "ring_sizer" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Ring Parameters
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-earth-400">US Ring Size:</span>
            <span className="text-clay-300 font-mono font-bold">
              {ringSize} ({(RING_SIZE_TO_MM[ringSize] ?? 14).toFixed(2)}mm ID)
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={17}
            step={1}
            value={ringSize}
            onChange={(e) => setRingSize(parseInt(e.target.value))}
            className="w-full accent-clay-500"
          />
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">
              Band Width: {bandWidth.toFixed(1)}mm
            </span>
            <input
              type="range"
              min={2}
              max={20}
              step={0.5}
              value={bandWidth}
              onChange={(e) => setBandWidth(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">
              Band Thickness: {bandThickness.toFixed(1)}mm
            </span>
            <input
              type="range"
              min={1}
              max={8}
              step={0.25}
              value={bandThickness}
              onChange={(e) => setBandThickness(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
          <div className="rounded-lg bg-earth-800/40 p-3 text-earth-500 text-xs space-y-1">
            <div>Inner diameter: {(RING_SIZE_TO_MM[ringSize] ?? 14).toFixed(2)}mm</div>
            <div>Outer diameter: {((RING_SIZE_TO_MM[ringSize] ?? 14) + bandThickness * 2).toFixed(2)}mm</div>
            <div>Band width: {bandWidth.toFixed(1)}mm</div>
          </div>
        </div>
      )}

      {/* Earring panel */}
      {activeTool === "earring_sizer" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Earring Dimensions
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Width: {earringWidth.toFixed(1)}mm</span>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={earringWidth}
              onChange={(e) => setEarringWidth(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Height: {earringHeight.toFixed(1)}mm</span>
            <input
              type="range"
              min={5}
              max={80}
              step={1}
              value={earringHeight}
              onChange={(e) => setEarringHeight(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Thickness: {earringThickness.toFixed(1)}mm</span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={earringThickness}
              onChange={(e) => setEarringThickness(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
        </div>
      )}

      {/* Mold gen */}
      {activeTool === "mold_gen" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 text-earth-400 text-sm">
          Mold generation creates a negative mold shell around the current
          geometry. Export as STL for 3D printing.
        </div>
      )}

      {/* Scale tool */}
      {activeTool === "scale" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Batch Scale
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Scale: {scaleValue.toFixed(2)}×</span>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.05}
              value={scaleValue}
              onChange={(e) => setScaleValue(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
        </div>
      )}

      {/* Mirror tool */}
      {activeTool === "mirror" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Mirror & Batch
          </p>
          <button
            onClick={handleMirrorBatch}
            className={cn(
              "py-2 rounded-lg text-sm font-semibold transition-colors border",
              isMirrored
                ? "bg-clay-600/20 border-clay-500/60 text-clay-300"
                : "bg-earth-800/60 border-earth-700/40 text-earth-300 hover:border-clay-600/40"
            )}
          >
            {isMirrored ? "Mirror: On" : "Mirror: Off"}
          </button>
          <p className="text-earth-600 text-xs">
            Creates a mirrored pair (e.g., left & right earrings) for export.
          </p>
        </div>
      )}

      {/* STL export button (always visible) */}
      <button
        onClick={handleExportSTL}
        className="py-2.5 rounded-lg bg-earth-700/40 hover:bg-earth-600/40 border border-earth-600/40 text-earth-300 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <span>⬇</span> Export STL
      </button>
    </div>
  );
}
