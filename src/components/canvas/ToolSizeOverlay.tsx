"use client";

import { useEffect, useState, useCallback } from "react";
import { useStudioStore } from "@/stores/studioStore";

interface MousePos {
  x: number;
  y: number;
}

export function ToolSizeOverlay() {
  const { canvasView } = useStudioStore();
  const { mode, toolSettings } = canvasView;
  const [pos, setPos] = useState<MousePos>({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseEnter = useCallback(() => setVisible(true), []);
  const handleMouseLeave = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (mode !== "sculpting") {
      setVisible(false);
      return;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mode, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  if (mode !== "sculpting" || !visible) return null;

  const diameter = toolSettings.size * 80;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-full border-2 border-clay-400/60 bg-clay-500/10"
      style={{
        left: pos.x - diameter / 2,
        top: pos.y - diameter / 2,
        width: diameter,
        height: diameter,
        transition: "width 0.1s, height 0.1s",
      }}
    >
      {/* Inner dot */}
      <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay-400/80" />
    </div>
  );
}
