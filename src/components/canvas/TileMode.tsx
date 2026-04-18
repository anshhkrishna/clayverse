"use client";

import { useState, useCallback } from "react";
import * as THREE from "three";
import { useCanvasEngine } from "@/hooks/useCanvas";
import { useStudioStore } from "@/stores/studioStore";
import { createSlabGeometry } from "@/lib/three/ClayGeometry";
import { cn } from "@/lib/utils";
import type { TileTool } from "@/types";

const TILE_TOOLS: { id: TileTool; label: string; icon: string }[] = [
  { id: "draw", label: "Draw", icon: "✏" },
  { id: "stamp", label: "Stamp", icon: "◈" },
  { id: "sgraffito", label: "Sgraffito", icon: "⊘" },
  { id: "repeat", label: "Repeat", icon: "⊞" },
  { id: "relief", label: "Relief", icon: "▲" },
];

type StampPattern = "circle" | "square" | "floral" | "geometric";

const STAMP_PRESETS: { id: StampPattern; label: string }[] = [
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "floral", label: "Floral" },
  { id: "geometric", label: "Geometric" },
];

function applyStampToGeometry(
  geometry: THREE.BufferGeometry,
  pattern: StampPattern,
  x: number,
  z: number,
  radius: number,
  depth: number
): void {
  const posAttr = geometry.attributes.position;
  if (!posAttr) return;
  const positions = posAttr.array as Float32Array;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    const vx = positions[i * 3];
    const vy = positions[i * 3 + 1];
    const vz = positions[i * 3 + 2];

    const dx = vx - x;
    const dz = vz - z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > radius) continue;

    const t = 1 - dist / radius;
    let displacement = 0;

    switch (pattern) {
      case "circle":
        displacement = depth * t * t;
        break;
      case "square": {
        const absMax = Math.max(Math.abs(dx), Math.abs(dz)) / radius;
        if (absMax < 0.9) displacement = depth * (1 - absMax);
        break;
      }
      case "floral": {
        const angle = Math.atan2(dz, dx);
        const petals = 5;
        const petalMod = (Math.cos(angle * petals) + 1) * 0.5;
        displacement = depth * t * petalMod;
        break;
      }
      case "geometric": {
        const angle2 = Math.atan2(dz, dx);
        const sides = 6;
        const geomMod = Math.cos(Math.round(angle2 * sides / Math.PI) * Math.PI / sides - angle2);
        displacement = depth * t * geomMod;
        break;
      }
    }

    positions[i * 3 + 1] = vy + displacement;
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

function applyRepeatPattern(
  geometry: THREE.BufferGeometry,
  pattern: StampPattern,
  spacingX: number,
  spacingZ: number,
  radius: number,
  depth: number,
  width: number,
  depth3d: number
): void {
  const cols = Math.floor(width / spacingX);
  const rows = Math.floor(depth3d / spacingZ);

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = -width / 2 + c * spacingX;
      const z = -depth3d / 2 + r * spacingZ;
      applyStampToGeometry(geometry, pattern, x, z, radius, depth);
    }
  }
}

export function TileMode() {
  const { mesh, setMeshGeometry } = useCanvasEngine();
  const { setActiveTool, canvasView } = useStudioStore();
  const activeTool = canvasView.activeTool as TileTool;

  const [slabSize, setSlabSize] = useState({ width: 20, height: 20 });
  const [stampPattern, setStampPattern] = useState<StampPattern>("circle");
  const [stampRadius, setStampRadius] = useState(2);
  const [stampDepth, setStampDepth] = useState(0.3);
  const [repeatSpacing, setRepeatSpacing] = useState({ x: 5, z: 5 });
  const [reliefDepth, setReliefDepth] = useState(0.5);

  const handleCreateSlab = useCallback(() => {
    const geo = createSlabGeometry(slabSize.width, 1, slabSize.height);
    setMeshGeometry(geo);
  }, [slabSize, setMeshGeometry]);

  const handleApplyStamp = useCallback(() => {
    if (!mesh) {
      // Create a slab first
      const geo = createSlabGeometry(slabSize.width, 1, slabSize.height);
      applyStampToGeometry(geo, stampPattern, 0, 0, stampRadius, stampDepth);
      setMeshGeometry(geo);
    } else {
      const geo = mesh.geometry.clone();
      applyStampToGeometry(geo, stampPattern, 0, 0, stampRadius, stampDepth);
      setMeshGeometry(geo);
    }
  }, [mesh, stampPattern, stampRadius, stampDepth, slabSize, setMeshGeometry]);

  const handleApplyRepeat = useCallback(() => {
    const geo = createSlabGeometry(slabSize.width, 1, slabSize.height);
    applyRepeatPattern(
      geo,
      stampPattern,
      repeatSpacing.x,
      repeatSpacing.z,
      stampRadius,
      stampDepth,
      slabSize.width,
      slabSize.height
    );
    setMeshGeometry(geo);
  }, [slabSize, stampPattern, repeatSpacing, stampRadius, stampDepth, setMeshGeometry]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tool selector */}
      <div className="flex flex-wrap gap-1.5">
        {TILE_TOOLS.map((t) => (
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

      {/* Slab creation */}
      <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
        <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
          Tile Surface
        </p>
        <div className="flex gap-3">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-earth-400 text-xs">W: {slabSize.width}cm</span>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={slabSize.width}
              onChange={(e) =>
                setSlabSize((s) => ({ ...s, width: parseInt(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-earth-400 text-xs">H: {slabSize.height}cm</span>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={slabSize.height}
              onChange={(e) =>
                setSlabSize((s) => ({ ...s, height: parseInt(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
        </div>
        <button
          onClick={handleCreateSlab}
          className="py-2 rounded-lg bg-earth-700/60 hover:bg-earth-600/60 text-earth-200 text-sm font-semibold transition-colors"
        >
          New Tile Surface
        </button>
      </div>

      {/* Stamp tool */}
      {(activeTool === "stamp" || activeTool === "repeat") && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Stamp Pattern
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {STAMP_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setStampPattern(p.id)}
                className={cn(
                  "py-1.5 rounded-md text-xs font-semibold transition-colors",
                  stampPattern === p.id
                    ? "bg-clay-500 text-white"
                    : "bg-earth-800/60 text-earth-300 hover:bg-earth-700/60"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Radius: {stampRadius.toFixed(1)}cm</span>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.25}
              value={stampRadius}
              onChange={(e) => setStampRadius(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Depth: {stampDepth.toFixed(2)}cm</span>
            <input
              type="range"
              min={0.05}
              max={2}
              step={0.05}
              value={stampDepth}
              onChange={(e) => setStampDepth(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
          <button
            onClick={handleApplyStamp}
            className="py-2 rounded-lg bg-clay-600 hover:bg-clay-500 text-white text-sm font-semibold transition-colors"
          >
            Apply Stamp
          </button>
        </div>
      )}

      {/* Repeat mode settings */}
      {activeTool === "repeat" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Repeat Spacing
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">X Spacing: {repeatSpacing.x.toFixed(1)}cm</span>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={repeatSpacing.x}
              onChange={(e) =>
                setRepeatSpacing((s) => ({ ...s, x: parseFloat(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Z Spacing: {repeatSpacing.z.toFixed(1)}cm</span>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={repeatSpacing.z}
              onChange={(e) =>
                setRepeatSpacing((s) => ({ ...s, z: parseFloat(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <button
            onClick={handleApplyRepeat}
            className="py-2 rounded-lg bg-clay-600 hover:bg-clay-500 text-white text-sm font-semibold transition-colors"
          >
            Tile Pattern
          </button>
        </div>
      )}

      {/* Draw mode */}
      {activeTool === "draw" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 text-earth-400 text-sm">
          Click and drag to draw raised lines on the tile surface. Adjust
          strength for relief depth.
        </div>
      )}

      {/* Relief mode */}
      {activeTool === "relief" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Relief Depth
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Max Depth: {reliefDepth.toFixed(2)}cm</span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              value={reliefDepth}
              onChange={(e) => setReliefDepth(parseFloat(e.target.value))}
              className="w-full accent-clay-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}
