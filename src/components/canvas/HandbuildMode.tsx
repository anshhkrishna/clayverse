"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import { useCanvasEngine } from "@/hooks/useCanvas";
import { applyCoilSegment, createSlabGeometry } from "@/lib/three/ClayGeometry";
import { useStudioStore } from "@/stores/studioStore";
import { cn } from "@/lib/utils";
import type { HandbuildTool } from "@/types";

const HANDBUILT_TOOLS: { id: HandbuildTool; label: string; icon: string }[] = [
  { id: "coil", label: "Coil", icon: "○" },
  { id: "slab", label: "Slab", icon: "□" },
  { id: "pinch", label: "Pinch", icon: "✦" },
  { id: "score_slip", label: "Score & Slip", icon: "⊘" },
  { id: "stamp", label: "Stamp", icon: "◈" },
  { id: "texture", label: "Texture", icon: "⣿" },
];

interface CoilParams {
  radius: number;
  height: number;
}

interface SlabParams {
  width: number;
  height: number;
  thickness: number;
}

export function HandbuildMode() {
  const { mesh, setMeshGeometry, sceneManager } = useCanvasEngine();
  const { setActiveTool, canvasView } = useStudioStore();
  const activeTool = canvasView.activeTool as HandbuildTool;

  const [coilParams, setCoilParams] = useState<CoilParams>({ radius: 0.5, height: 5 });
  const [slabParams, setSlabParams] = useState<SlabParams>({
    width: 15,
    height: 15,
    thickness: 1,
  });
  const [ghostVisible, setGhostVisible] = useState(false);
  const [ghostY, setGhostY] = useState(5);
  const ghostRef = useRef<THREE.Mesh | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show ghost preview on mouse hover over the canvas area
  const showGhostCoil = useCallback(
    (y: number) => {
      if (!sceneManager) return;
      // Remove previous ghost
      if (ghostRef.current) {
        sceneManager.scene.remove(ghostRef.current);
        ghostRef.current.geometry.dispose();
        ghostRef.current = null;
      }

      const geo = new THREE.TorusGeometry(coilParams.radius * 8, coilParams.radius * 0.5, 8, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xc4895a,
        transparent: true,
        opacity: 0.4,
        wireframe: false,
      });
      const ghost = new THREE.Mesh(geo, mat);
      ghost.position.set(0, y, 0);
      ghost.name = "__ghostCoil";
      sceneManager.scene.add(ghost);
      ghostRef.current = ghost;
    },
    [sceneManager, coilParams.radius]
  );

  const hideGhost = useCallback(() => {
    if (ghostRef.current && sceneManager) {
      sceneManager.scene.remove(ghostRef.current);
      ghostRef.current.geometry.dispose();
      ghostRef.current = null;
    }
  }, [sceneManager]);

  // Cleanup ghost on unmount
  useEffect(() => {
    return () => {
      hideGhost();
    };
  }, [hideGhost]);

  const handleAddCoil = useCallback(() => {
    if (!mesh) return;
    const geo = mesh.geometry.clone();
    const pos = new THREE.Vector3(0, coilParams.height, 0);
    const updated = applyCoilSegment(geo, pos, coilParams.radius);
    setMeshGeometry(updated);
  }, [mesh, coilParams, setMeshGeometry]);

  const handleCreateSlab = useCallback(() => {
    const geo = createSlabGeometry(
      slabParams.width,
      slabParams.thickness,
      slabParams.height
    );
    setMeshGeometry(geo);
  }, [slabParams, setMeshGeometry]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tool selector */}
      <div className="flex flex-wrap gap-1.5">
        {HANDBUILT_TOOLS.map((t) => (
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
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Coil tool panel */}
      {activeTool === "coil" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Coil Settings
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Coil Radius: {coilParams.radius.toFixed(2)}cm</span>
            <input
              type="range"
              min={0.2}
              max={2}
              step={0.05}
              value={coilParams.radius}
              onChange={(e) =>
                setCoilParams((p) => ({ ...p, radius: parseFloat(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">
              Placement Height: {coilParams.height.toFixed(1)}cm
            </span>
            <input
              type="range"
              min={0}
              max={50}
              step={0.5}
              value={coilParams.height}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setCoilParams((p) => ({ ...p, height: v }));
                showGhostCoil(v);
              }}
              onMouseEnter={() => showGhostCoil(coilParams.height)}
              onMouseLeave={() => hideGhost()}
              className="w-full accent-clay-500"
            />
          </label>
          <button
            onClick={handleAddCoil}
            className="mt-1 py-2 rounded-lg bg-clay-600 hover:bg-clay-500 text-white text-sm font-semibold transition-colors"
          >
            Add Coil Ring
          </button>
        </div>
      )}

      {/* Slab tool panel */}
      {activeTool === "slab" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
          <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
            Slab Settings
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Width: {slabParams.width.toFixed(1)}cm</span>
            <input
              type="range"
              min={3}
              max={40}
              step={0.5}
              value={slabParams.width}
              onChange={(e) =>
                setSlabParams((p) => ({ ...p, width: parseFloat(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">Height: {slabParams.height.toFixed(1)}cm</span>
            <input
              type="range"
              min={3}
              max={40}
              step={0.5}
              value={slabParams.height}
              onChange={(e) =>
                setSlabParams((p) => ({ ...p, height: parseFloat(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-earth-400 text-xs">
              Thickness: {slabParams.thickness.toFixed(2)}cm
            </span>
            <input
              type="range"
              min={0.3}
              max={5}
              step={0.1}
              value={slabParams.thickness}
              onChange={(e) =>
                setSlabParams((p) => ({ ...p, thickness: parseFloat(e.target.value) }))
              }
              className="w-full accent-clay-500"
            />
          </label>
          <button
            onClick={handleCreateSlab}
            className="mt-1 py-2 rounded-lg bg-clay-600 hover:bg-clay-500 text-white text-sm font-semibold transition-colors"
          >
            Create Slab
          </button>
        </div>
      )}

      {/* Pinch info */}
      {activeTool === "pinch" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 text-earth-400 text-sm">
          Click and drag on the mesh to pinch and shape the clay. Use the sculpt
          brush size control to adjust pinch area.
        </div>
      )}

      {/* Score & Slip info */}
      {activeTool === "score_slip" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 text-earth-400 text-sm">
          Score the surface before joining clay pieces. Drag to apply score
          lines, then apply slip to bond sections.
        </div>
      )}

      {/* Stamp info */}
      {activeTool === "stamp" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 text-earth-400 text-sm">
          Click the surface to stamp a decorative impression. Adjust tool size
          to control stamp diameter.
        </div>
      )}

      {/* Texture info */}
      {activeTool === "texture" && (
        <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 text-earth-400 text-sm">
          Paint surface texture by dragging across the mesh. Adjust strength and
          size in the tool settings panel.
        </div>
      )}
    </div>
  );
}
