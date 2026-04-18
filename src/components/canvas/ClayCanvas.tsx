"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useCanvasEngine } from "@/hooks/useCanvas";
import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";
import type { ModelingMode } from "@/types";

const TOOL_LABELS: Record<string, string> = {
  center: "Center",
  pull: "Pull",
  flare: "Flare",
  collar: "Collar",
  rib: "Rib",
  trim: "Trim",
  coil: "Coil",
  slab: "Slab",
  pinch: "Pinch",
  score_slip: "Score & Slip",
  stamp: "Stamp",
  texture: "Texture",
  push: "Push",
  smooth: "Smooth",
  inflate: "Inflate",
  flatten: "Flatten",
  crease: "Crease",
  subtract: "Subtract",
  add: "Add",
  draw: "Draw",
  sgraffito: "Sgraffito",
  repeat: "Repeat",
  relief: "Relief",
  ring_sizer: "Ring Sizer",
  earring_sizer: "Earring Sizer",
  mold_gen: "Mold Gen",
  scale: "Scale",
  mirror: "Mirror",
};

const MODE_CURSOR: Record<ModelingMode, string> = {
  wheel: "cursor-crosshair",
  handbuilding: "cursor-cell",
  sculpting: "cursor-none",
  tile: "cursor-crosshair",
  jewelry: "cursor-crosshair",
  mixed: "cursor-default",
};

interface MousePos {
  x: number;
  y: number;
}

interface ClayCanvasProps {
  className?: string;
}

export function ClayCanvas({ className }: ClayCanvasProps) {
  const { canvasRef, isReady, takeScreenshot } = useCanvasEngine();
  const { canvasView, simulationResult } = useStudioStore();
  const { mode, activeTool, showThicknessMap } = canvasView;
  const [mousePos, setMousePos] = useState<MousePos>({ x: -100, y: -100 });
  const containerRef = useRef<HTMLDivElement>(null);

  const hasThicknessWarning =
    simulationResult?.warningFlags.some(
      (w) => w.type === "wall_too_thin" && w.severity !== "info"
    ) ?? false;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: -100, y: -100 });
  }, []);

  const cursorClass = MODE_CURSOR[mode] ?? "cursor-crosshair";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#1a1410]",
        cursorClass,
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: "none" }}
      />

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1410]/90 z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-clay-500/30 border-t-clay-500 rounded-full animate-spin" />
            <p className="text-earth-300 text-sm font-medium tracking-wide">
              Initializing canvas...
            </p>
          </div>
        </div>
      )}

      {/* Sculpt mode brush cursor indicator */}
      {mode === "sculpting" && isReady && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-clay-400/70 bg-clay-500/10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            width: canvasView.toolSettings.size * 80,
            height: canvasView.toolSettings.size * 80,
          }}
        />
      )}

      {/* Crosshair (non-sculpt modes) */}
      {mode !== "sculpting" && isReady && (
        <>
          <div
            className="pointer-events-none absolute w-5 h-px bg-clay-400/60 -translate-x-1/2 -translate-y-1/2"
            style={{ left: mousePos.x, top: mousePos.y }}
          />
          <div
            className="pointer-events-none absolute w-px h-5 bg-clay-400/60 -translate-x-1/2 -translate-y-1/2"
            style={{ left: mousePos.x, top: mousePos.y }}
          />
        </>
      )}

      {/* Active tool badge */}
      {isReady && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm text-clay-300 text-xs font-mono tracking-wider border border-clay-800/60">
            {TOOL_LABELS[activeTool] ?? activeTool}
          </span>
          {showThicknessMap && (
            <span className="px-2.5 py-1 rounded-md bg-blue-900/60 backdrop-blur-sm text-blue-200 text-xs font-mono border border-blue-700/60">
              Thickness Map
            </span>
          )}
        </div>
      )}

      {/* Thickness warning badge */}
      {hasThicknessWarning && isReady && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-red-900/80 backdrop-blur-sm border border-red-600/60 text-red-200 text-xs font-medium flex items-center gap-2 pointer-events-none">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Wall too thin — cracking risk
        </div>
      )}

      {/* Mode indicator (top-left) */}
      {isReady && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-earth-800/40 pointer-events-none">
          <span className="text-earth-400 text-xs uppercase tracking-widest font-semibold">
            {mode}
          </span>
        </div>
      )}
    </div>
  );
}
