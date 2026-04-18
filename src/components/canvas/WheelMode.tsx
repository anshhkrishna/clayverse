"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCanvasEngine } from "@/hooks/useCanvas";
import {
  createLatheGeometry,
  generateProfileFromParams,
  type WheelParams,
} from "@/lib/three/ClayGeometry";
import { useStudioStore } from "@/stores/studioStore";
import { clamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

type WheelTool = "center" | "pull" | "flare" | "collar" | "rib" | "trim";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function VerticalSlider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <span className="text-earth-400 text-[10px] uppercase tracking-wide font-semibold">
        {label}
      </span>
      <div className="relative h-32 flex items-center justify-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="appearance-none h-32 w-2 rounded-full bg-earth-800 cursor-pointer"
          style={{
            writingMode: "vertical-lr" as const,
            direction: "rtl",
            WebkitAppearance: "slider-vertical",
          }}
        />
      </div>
      <span className="text-clay-300 text-xs font-mono">
        {value.toFixed(1)}{unit}
      </span>
    </div>
  );
}

const WHEEL_TOOLS: { id: WheelTool; label: string }[] = [
  { id: "pull", label: "Pull" },
  { id: "center", label: "Center" },
  { id: "flare", label: "Flare" },
  { id: "collar", label: "Collar" },
  { id: "rib", label: "Rib" },
  { id: "trim", label: "Trim" },
];

export function WheelMode() {
  const { setMeshGeometry } = useCanvasEngine();
  const { setActiveTool, canvasView } = useStudioStore();
  const activeTool = canvasView.activeTool as WheelTool;

  const [params, setParams] = useState<WheelParams>({
    height: 18,
    bodyRadius: 8,
    neckRadius: 4,
    footRadius: 3.5,
    rimFlare: 1,
    wallThickness: 0.7,
  });

  const [isThrowing, setIsThrowing] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const animRef = useRef<number | null>(null);

  // Regenerate geometry when params change
  useEffect(() => {
    const profile = generateProfileFromParams(params);
    const geo = createLatheGeometry(profile, 64);
    setMeshGeometry(geo);
  }, [params, setMeshGeometry]);

  // Wheel spinning animation
  useEffect(() => {
    if (isThrowing) {
      const spin = () => {
        setWheelAngle((a) => (a + 3) % 360);
        animRef.current = requestAnimationFrame(spin);
      };
      animRef.current = requestAnimationFrame(spin);
    } else {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    }
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [isThrowing]);

  const updateParam = useCallback(
    <K extends keyof WheelParams>(key: K, value: WheelParams[K]) => {
      setParams((p) => ({ ...p, [key]: value }));
    },
    []
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tool selector */}
      <div className="flex flex-wrap gap-1.5">
        {WHEEL_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
              activeTool === t.id
                ? "bg-clay-500 text-white"
                : "bg-earth-800/60 text-earth-300 hover:bg-earth-700/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Wheel animation button */}
      <button
        onClick={() => setIsThrowing((v) => !v)}
        className={cn(
          "relative flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all border",
          isThrowing
            ? "bg-clay-600/20 border-clay-500/60 text-clay-300"
            : "bg-earth-900/60 border-earth-700/40 text-earth-400 hover:border-clay-600/40"
        )}
      >
        {/* Spinning disc icon */}
        <span
          className="inline-block w-5 h-5 rounded-full border-2 border-clay-400/60 border-t-clay-400 transition-transform"
          style={{
            transform: `rotate(${wheelAngle}deg)`,
            transition: isThrowing ? "none" : undefined,
          }}
        />
        {isThrowing ? "Stop Wheel" : "Turn Wheel"}
      </button>

      {/* Parameter sliders */}
      <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40">
        <p className="text-earth-500 text-[10px] uppercase tracking-widest mb-3 font-semibold">
          Form Parameters
        </p>
        <div className="flex justify-between gap-2 overflow-x-auto pb-1">
          <VerticalSlider
            label="Height"
            value={params.height}
            min={5}
            max={50}
            step={0.5}
            unit="cm"
            onChange={(v) => updateParam("height", v)}
          />
          <VerticalSlider
            label="Body R"
            value={params.bodyRadius}
            min={3}
            max={20}
            step={0.5}
            unit="cm"
            onChange={(v) => updateParam("bodyRadius", v)}
          />
          <VerticalSlider
            label="Neck R"
            value={params.neckRadius}
            min={1}
            max={15}
            step={0.5}
            unit="cm"
            onChange={(v) => updateParam("neckRadius", v)}
          />
          <VerticalSlider
            label="Foot R"
            value={params.footRadius}
            min={2}
            max={8}
            step={0.25}
            unit="cm"
            onChange={(v) => updateParam("footRadius", v)}
          />
          <VerticalSlider
            label="Flare"
            value={params.rimFlare}
            min={-10}
            max={10}
            step={0.5}
            unit=""
            onChange={(v) => updateParam("rimFlare", v)}
          />
          <VerticalSlider
            label="Wall"
            value={params.wallThickness}
            min={0.3}
            max={2}
            step={0.05}
            unit="cm"
            onChange={(v) => updateParam("wallThickness", v)}
          />
        </div>
      </div>
    </div>
  );
}
