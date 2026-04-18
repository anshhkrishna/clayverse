"use client";

import { useStudioStore } from "@/stores/studioStore";
import { ClayCanvas } from "@/components/canvas/ClayCanvas";
import { WheelMode } from "@/components/canvas/WheelMode";
import { HandbuildMode } from "@/components/canvas/HandbuildMode";
import { SculptMode } from "@/components/canvas/SculptMode";
import { TileMode } from "@/components/canvas/TileMode";
import { JewelryMode } from "@/components/canvas/JewelryMode";
import { ToolBar } from "@/components/studio/ToolBar";
import { ViewControls } from "@/components/studio/ViewControls";
import { ToolSizeOverlay } from "@/components/canvas/ToolSizeOverlay";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { ModelingMode } from "@/types";

function ModePanel({ mode }: { mode: ModelingMode }) {
  switch (mode) {
    case "wheel":
      return <WheelMode />;
    case "handbuilding":
      return <HandbuildMode />;
    case "sculpting":
      return <SculptMode />;
    case "tile":
      return <TileMode />;
    case "jewelry":
      return <JewelryMode />;
    default:
      return null;
  }
}

const MODE_LABELS: Record<ModelingMode, string> = {
  wheel: "Wheel Throwing",
  handbuilding: "Hand Building",
  sculpting: "Sculpting",
  tile: "Tile & Relief",
  jewelry: "Jewelry",
  mixed: "Mixed",
};

export default function StudioPage() {
  const { canvasView } = useStudioStore();
  const { mode } = canvasView;

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="flex w-screen h-screen bg-[#1a1410] overflow-hidden">
      {/* Global sculpt brush overlay */}
      <ToolSizeOverlay />

      {/* Left Toolbar */}
      <ToolBar />

      {/* Main canvas area */}
      <div className="relative flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-3">
          <ViewControls />
        </div>

        {/* Canvas fills entire area */}
        <ClayCanvas className="flex-1 w-full h-full" />
      </div>

      {/* Right mode panel */}
      <aside className="w-64 shrink-0 bg-earth-950/95 border-l border-earth-800/50 flex flex-col overflow-y-auto">
        {/* Mode label header */}
        <div className="px-4 py-3 border-b border-earth-800/50">
          <h2 className="text-earth-300 text-sm font-semibold">
            {MODE_LABELS[mode]}
          </h2>
          <p className="text-earth-600 text-[11px] mt-0.5">
            Press 1–5 to switch modes
          </p>
        </div>

        {/* Mode-specific controls */}
        <div className="flex-1 p-4 overflow-y-auto">
          <ModePanel mode={mode} />
        </div>

        {/* Bottom shortcuts hint */}
        <div className="px-4 py-3 border-t border-earth-800/50">
          <div className="grid grid-cols-2 gap-1 text-[10px] text-earth-600">
            <div><kbd className="bg-earth-800 px-1 rounded text-[9px]">W</kbd> Wireframe</div>
            <div><kbd className="bg-earth-800 px-1 rounded text-[9px]">G</kbd> Grid</div>
            <div><kbd className="bg-earth-800 px-1 rounded text-[9px]">T</kbd> Thickness</div>
            <div><kbd className="bg-earth-800 px-1 rounded text-[9px]">[ ]</kbd> Brush size</div>
            <div><kbd className="bg-earth-800 px-1 rounded text-[9px]">Z</kbd> Undo</div>
            <div><kbd className="bg-earth-800 px-1 rounded text-[9px]">⇧Z</kbd> Redo</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
