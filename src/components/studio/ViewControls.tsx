"use client";

import { useStudioStore } from "@/stores/studioStore";
import { useCanvasEngine } from "@/hooks/useCanvas";
import { cn } from "@/lib/utils";

type CameraPreset = "front" | "side" | "top" | "perspective";

const CAMERA_PRESETS: { id: CameraPreset; label: string; icon: string }[] = [
  { id: "front", label: "Front", icon: "F" },
  { id: "side", label: "Side", icon: "S" },
  { id: "top", label: "Top", icon: "T" },
  { id: "perspective", label: "Persp", icon: "P" },
];

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  activeClass?: string;
}

function ToggleButton({
  active,
  onClick,
  label,
  icon,
  activeClass = "bg-clay-500/20 text-clay-300 border-clay-500/50",
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
        active
          ? activeClass
          : "bg-black/40 text-earth-400 border-earth-700/40 hover:border-earth-600/40 hover:text-earth-300"
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function ViewControls() {
  const { canvasView, setCanvasView } = useStudioStore();
  const { showGrid, showWireframe, showThicknessMap } = canvasView;
  const { sceneManager } = useCanvasEngine();

  const setCameraPreset = (preset: CameraPreset) => {
    sceneManager?.setCameraPreset(preset);
  };

  const handleZoomFit = () => {
    sceneManager?.fitToMesh();
  };

  return (
    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-earth-800/50 rounded-xl px-3 py-2 shadow-xl">
      {/* View toggles */}
      <div className="flex items-center gap-1.5">
        <ToggleButton
          active={showGrid}
          onClick={() => setCanvasView({ showGrid: !showGrid })}
          label="Grid"
          icon="⊞"
        />
        <ToggleButton
          active={showWireframe}
          onClick={() => setCanvasView({ showWireframe: !showWireframe })}
          label="Wire"
          icon="⬡"
        />
        <ToggleButton
          active={showThicknessMap}
          onClick={() => setCanvasView({ showThicknessMap: !showThicknessMap })}
          label="Thick"
          icon="◈"
          activeClass="bg-blue-900/40 text-blue-300 border-blue-600/50"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-earth-700/50" />

      {/* Camera presets */}
      <div className="flex items-center gap-1">
        {CAMERA_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraPreset(p.id)}
            title={`${p.label} view`}
            className="w-8 h-7 flex items-center justify-center rounded-md text-xs font-mono font-bold text-earth-400 hover:text-earth-200 hover:bg-earth-800/50 transition-colors"
          >
            {p.icon}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-earth-700/50" />

      {/* Zoom fit */}
      <button
        onClick={handleZoomFit}
        title="Zoom to fit"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-black/40 text-earth-400 border border-earth-700/40 hover:border-earth-600/40 hover:text-earth-300 transition-all"
      >
        <span>⤡</span>
        <span>Fit</span>
      </button>
    </div>
  );
}
