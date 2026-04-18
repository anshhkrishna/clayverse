"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/stores/studioStore";
import type { ModelingMode, ActiveTool } from "@/types";
import { clamp } from "@/lib/utils";

const MODE_MAP: Record<string, ModelingMode> = {
  "1": "wheel",
  "2": "handbuilding",
  "3": "sculpting",
  "4": "tile",
  "5": "jewelry",
};

const MODE_DEFAULT_TOOLS: Record<ModelingMode, ActiveTool> = {
  wheel: "pull",
  handbuilding: "coil",
  sculpting: "push",
  tile: "draw",
  jewelry: "ring_sizer",
  mixed: "pull",
};

export function useKeyboardShortcuts(): void {
  const store = useStudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      // Ignore when focused on input/textarea/select
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // ─── Undo / Redo ────────────────────────────────────────
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        store.redo();
        return;
      }
      if (ctrlOrCmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        store.undo();
        return;
      }

      // Standalone Z (no modifier) — also undo
      if (!ctrlOrCmd && !e.shiftKey && !e.altKey && e.key === "z") {
        store.undo();
        return;
      }
      if (!ctrlOrCmd && e.shiftKey && !e.altKey && e.key === "Z") {
        store.redo();
        return;
      }

      // ─── Toggle Wireframe ────────────────────────────────────
      if (!ctrlOrCmd && !e.shiftKey && !e.altKey && e.key === "w") {
        store.setCanvasView({ showWireframe: !store.canvasView.showWireframe });
        return;
      }

      // ─── Toggle Grid ─────────────────────────────────────────
      if (!ctrlOrCmd && !e.shiftKey && !e.altKey && e.key === "g") {
        store.setCanvasView({ showGrid: !store.canvasView.showGrid });
        return;
      }

      // ─── Toggle Thickness Map ────────────────────────────────
      if (!ctrlOrCmd && !e.shiftKey && !e.altKey && e.key === "t") {
        store.setCanvasView({
          showThicknessMap: !store.canvasView.showThicknessMap,
        });
        return;
      }

      // ─── Mode Switch 1–5 ─────────────────────────────────────
      if (!ctrlOrCmd && !e.shiftKey && !e.altKey && MODE_MAP[e.key]) {
        const mode = MODE_MAP[e.key];
        store.setMode(mode);
        store.setActiveTool(MODE_DEFAULT_TOOLS[mode]);
        return;
      }

      // ─── Tool size decrease [ ────────────────────────────────
      if (e.key === "[") {
        const current = store.canvasView.toolSettings.size;
        store.setToolSettings({ size: clamp(current - 0.05, 0.05, 3.0) });
        return;
      }

      // ─── Tool size increase ] ────────────────────────────────
      if (e.key === "]") {
        const current = store.canvasView.toolSettings.size;
        store.setToolSettings({ size: clamp(current + 0.05, 0.05, 3.0) });
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [store]);
}
