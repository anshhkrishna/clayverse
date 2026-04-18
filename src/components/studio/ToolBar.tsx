"use client";

import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";
import type {
  ActiveTool,
  ModelingMode,
  WheelTool,
  HandbuildTool,
  SculptTool,
  TileTool,
  JewelryTool,
} from "@/types";

interface ToolDef {
  id: ActiveTool;
  label: string;
  icon: string;
}

const WHEEL_TOOLS: ToolDef[] = [
  { id: "pull" as WheelTool, label: "Pull", icon: "↑" },
  { id: "center" as WheelTool, label: "Center", icon: "⊙" },
  { id: "flare" as WheelTool, label: "Flare", icon: "↗" },
  { id: "collar" as WheelTool, label: "Collar", icon: "⊂" },
  { id: "rib" as WheelTool, label: "Rib", icon: "≡" },
  { id: "trim" as WheelTool, label: "Trim", icon: "✂" },
];

const HANDBUILT_TOOLS: ToolDef[] = [
  { id: "coil" as HandbuildTool, label: "Coil", icon: "○" },
  { id: "slab" as HandbuildTool, label: "Slab", icon: "□" },
  { id: "pinch" as HandbuildTool, label: "Pinch", icon: "✦" },
  { id: "score_slip" as HandbuildTool, label: "Score", icon: "⊘" },
  { id: "stamp" as HandbuildTool, label: "Stamp", icon: "◈" },
  { id: "texture" as HandbuildTool, label: "Texture", icon: "⣿" },
];

const SCULPT_TOOLS: ToolDef[] = [
  { id: "pull" as SculptTool, label: "Pull", icon: "↑" },
  { id: "push" as SculptTool, label: "Push", icon: "↓" },
  { id: "smooth" as SculptTool, label: "Smooth", icon: "~" },
  { id: "inflate" as SculptTool, label: "Inflate", icon: "◉" },
  { id: "flatten" as SculptTool, label: "Flatten", icon: "—" },
  { id: "crease" as SculptTool, label: "Crease", icon: "∧" },
  { id: "add" as SculptTool, label: "Add", icon: "+" },
  { id: "subtract" as SculptTool, label: "Sub", icon: "−" },
];

const TILE_TOOLS: ToolDef[] = [
  { id: "draw" as TileTool, label: "Draw", icon: "✏" },
  { id: "stamp" as TileTool, label: "Stamp", icon: "◈" },
  { id: "sgraffito" as TileTool, label: "Graffito", icon: "⊘" },
  { id: "repeat" as TileTool, label: "Repeat", icon: "⊞" },
  { id: "relief" as TileTool, label: "Relief", icon: "▲" },
];

const JEWELRY_TOOLS: ToolDef[] = [
  { id: "ring_sizer" as JewelryTool, label: "Ring", icon: "◯" },
  { id: "earring_sizer" as JewelryTool, label: "Earring", icon: "◇" },
  { id: "mold_gen" as JewelryTool, label: "Mold", icon: "⬡" },
  { id: "scale" as JewelryTool, label: "Scale", icon: "⤡" },
  { id: "mirror" as JewelryTool, label: "Mirror", icon: "⇌" },
];

const TOOLS_BY_MODE: Record<ModelingMode, ToolDef[]> = {
  wheel: WHEEL_TOOLS,
  handbuilding: HANDBUILT_TOOLS,
  sculpting: SCULPT_TOOLS,
  tile: TILE_TOOLS,
  jewelry: JEWELRY_TOOLS,
  mixed: SCULPT_TOOLS,
};

const MODE_ICONS: Record<ModelingMode, string> = {
  wheel: "⟳",
  handbuilding: "✋",
  sculpting: "✦",
  tile: "⊞",
  jewelry: "◯",
  mixed: "⊕",
};

const MODES: { id: ModelingMode; label: string }[] = [
  { id: "wheel", label: "Wheel" },
  { id: "handbuilding", label: "Build" },
  { id: "sculpting", label: "Sculpt" },
  { id: "tile", label: "Tile" },
  { id: "jewelry", label: "Jewelry" },
];

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:flex items-center">
        <div className="bg-earth-900 border border-earth-700/60 text-earth-300 text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
}

export function ToolBar() {
  const { canvasView, setMode, setActiveTool } = useStudioStore();
  const { mode, activeTool } = canvasView;
  const tools = TOOLS_BY_MODE[mode] ?? [];

  return (
    <aside className="flex flex-col items-center gap-1 w-14 bg-earth-950/95 border-r border-earth-800/50 py-3 shrink-0 overflow-y-auto">
      {/* Mode switcher */}
      <div className="flex flex-col gap-0.5 w-full px-1.5 mb-2">
        {MODES.map((m) => (
          <Tooltip key={m.id} label={m.label}>
            <button
              onClick={() => setMode(m.id)}
              className={cn(
                "w-full h-9 flex flex-col items-center justify-center rounded-lg text-xs transition-colors",
                mode === m.id
                  ? "bg-clay-500/20 text-clay-400 border border-clay-500/40"
                  : "text-earth-500 hover:text-earth-300 hover:bg-earth-800/40"
              )}
              title={m.label}
            >
              <span className="text-base leading-none">{MODE_ICONS[m.id]}</span>
              <span className="text-[9px] mt-0.5 uppercase tracking-wider">{m.label.slice(0, 3)}</span>
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-earth-800/60 mb-1" />

      {/* Tool buttons */}
      <div className="flex flex-col gap-0.5 w-full px-1.5">
        {tools.map((tool) => (
          <Tooltip key={`${mode}-${tool.id}`} label={tool.label}>
            <button
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "w-full h-9 flex flex-col items-center justify-center rounded-lg transition-colors text-xs",
                activeTool === tool.id
                  ? "bg-clay-500 text-white shadow-md"
                  : "text-earth-400 hover:text-earth-200 hover:bg-earth-800/50"
              )}
              title={tool.label}
            >
              <span className="text-base leading-none">{tool.icon}</span>
              <span className="text-[9px] mt-0.5">{tool.label.slice(0, 5)}</span>
            </button>
          </Tooltip>
        ))}
      </div>
    </aside>
  );
}
