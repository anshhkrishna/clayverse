"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import { useCanvasEngine } from "@/hooks/useCanvas";
import { useStudioStore } from "@/stores/studioStore";
import { cn, clamp } from "@/lib/utils";
import type { SculptTool } from "@/types";

const SCULPT_TOOLS: { id: SculptTool; label: string; icon: string; description: string }[] = [
  { id: "pull", label: "Pull", icon: "↑", description: "Pull vertices outward" },
  { id: "push", label: "Push", icon: "↓", description: "Push vertices inward" },
  { id: "smooth", label: "Smooth", icon: "~", description: "Average neighboring vertices" },
  { id: "inflate", label: "Inflate", icon: "◉", description: "Expand along normals" },
  { id: "flatten", label: "Flatten", icon: "—", description: "Flatten to a plane" },
  { id: "crease", label: "Crease", icon: "∧", description: "Sharp pinch crease" },
  { id: "add", label: "Add", icon: "+", description: "Add clay material" },
  { id: "subtract", label: "Subtract", icon: "−", description: "Remove clay material" },
];

/**
 * Apply sculpt brush deformation to the geometry.
 */
function sculptDeform(
  geometry: THREE.BufferGeometry,
  hitPoint: THREE.Vector3,
  hitNormal: THREE.Vector3,
  tool: SculptTool,
  brushSize: number,
  strength: number,
  symmetry: boolean
): void {
  const posAttr = geometry.attributes.position;
  if (!posAttr) return;

  const positions = posAttr.array as Float32Array;
  const count = posAttr.count;
  const r2 = brushSize * brushSize;

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    const processVertex = (vx: number, vy: number, vz: number, idx: number) => {
      const dx = vx - hitPoint.x;
      const dy = vy - hitPoint.y;
      const dz = vz - hitPoint.z;
      const dist2 = dx * dx + dy * dy + dz * dz;

      if (dist2 > r2) return;

      // Smooth (cosine) falloff
      const t = dist2 / r2;
      const falloff = (1 - t) * (1 - t);
      const delta = falloff * strength;

      switch (tool) {
        case "pull":
          positions[idx] += hitNormal.x * delta;
          positions[idx + 1] += hitNormal.y * delta;
          positions[idx + 2] += hitNormal.z * delta;
          break;
        case "push":
          positions[idx] -= hitNormal.x * delta;
          positions[idx + 1] -= hitNormal.y * delta;
          positions[idx + 2] -= hitNormal.z * delta;
          break;
        case "inflate": {
          // Inflate: push along local vertex normal (approximate with world normal)
          const len = Math.sqrt(vx * vx + vz * vz) + 0.0001;
          const nx = vx / len;
          const nz = vz / len;
          positions[idx] += nx * delta;
          positions[idx + 2] += nz * delta;
          break;
        }
        case "smooth": {
          // Smooth: move toward average of neighbors (simplified: move toward hitPoint slightly)
          positions[idx] += (hitPoint.x - vx) * delta * 0.3;
          positions[idx + 1] += (hitPoint.y - vy) * delta * 0.3;
          positions[idx + 2] += (hitPoint.z - vz) * delta * 0.3;
          break;
        }
        case "flatten": {
          // Flatten: move y toward the hit point y
          positions[idx + 1] += (hitPoint.y - vy) * delta * 0.5;
          break;
        }
        case "crease": {
          // Crease: strong pull toward the brush center
          positions[idx] += (hitPoint.x - vx) * delta * 0.8;
          positions[idx + 1] += (hitPoint.y - vy) * delta * 0.8;
          positions[idx + 2] += (hitPoint.z - vz) * delta * 0.8;
          break;
        }
        case "add": {
          positions[idx] += hitNormal.x * delta * 0.5;
          positions[idx + 1] += hitNormal.y * delta * 0.5;
          positions[idx + 2] += hitNormal.z * delta * 0.5;
          break;
        }
        case "subtract": {
          positions[idx] -= hitNormal.x * delta * 0.5;
          positions[idx + 1] -= hitNormal.y * delta * 0.5;
          positions[idx + 2] -= hitNormal.z * delta * 0.5;
          break;
        }
      }
    };

    processVertex(x, y, z, i * 3);

    if (symmetry) {
      // Mirror across X axis
      processVertex(-x, y, z, i * 3);
    }
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function SculptMode() {
  const { mesh, setMeshGeometry, sceneManager } = useCanvasEngine();
  const { setActiveTool, setToolSettings, canvasView } = useStudioStore();
  const { activeTool, toolSettings } = canvasView;
  const sculptTool = activeTool as SculptTool;

  const [symmetry, setSymmetry] = useState(toolSettings.symmetry);
  const isPaintingRef = useRef(false);
  const raycasterRef = useRef(new THREE.Raycaster());

  const handleSymmetryToggle = useCallback(() => {
    const next = !symmetry;
    setSymmetry(next);
    setToolSettings({ symmetry: next, mirrorAxis: next ? "x" : "none" });
  }, [symmetry, setToolSettings]);

  const doSculpt = useCallback(
    (clientX: number, clientY: number) => {
      const sm = sceneManager;
      if (!sm || !mesh) return;

      const canvas = sm.renderer.domElement;
      const rect = canvas.getBoundingClientRect();

      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(
        new THREE.Vector2(ndcX, ndcY),
        sm.camera
      );
      const intersects = raycasterRef.current.intersectObject(mesh, false);

      if (intersects.length === 0) return;
      const hit = intersects[0];

      const geo = mesh.geometry;
      sculptDeform(
        geo,
        hit.point,
        hit.face?.normal ?? new THREE.Vector3(0, 1, 0),
        sculptTool,
        toolSettings.size * 8,
        toolSettings.strength * 0.5,
        symmetry
      );
      // Push updated geometry to scene
      mesh.geometry.attributes.position.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    },
    [sceneManager, mesh, sculptTool, toolSettings, symmetry]
  );

  // Mouse event handlers on the canvas
  useEffect(() => {
    const sm = sceneManager;
    if (!sm) return;
    const canvas = sm.renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isPaintingRef.current = true;
      doSculpt(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPaintingRef.current) return;
      doSculpt(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      isPaintingRef.current = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [sceneManager, doSculpt]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tool selector */}
      <div className="grid grid-cols-4 gap-1.5">
        {SCULPT_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            title={t.description}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs font-semibold transition-colors",
              sculptTool === t.id
                ? "bg-clay-500 text-white"
                : "bg-earth-800/60 text-earth-300 hover:bg-earth-700/60"
            )}
          >
            <span className="text-base">{t.icon}</span>
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Brush settings */}
      <div className="bg-earth-900/40 rounded-xl p-4 border border-earth-800/40 flex flex-col gap-3">
        <p className="text-earth-500 text-[10px] uppercase tracking-widest font-semibold">
          Brush
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-earth-400 text-xs">
            Size: {toolSettings.size.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={toolSettings.size}
            onChange={(e) => setToolSettings({ size: parseFloat(e.target.value) })}
            className="w-full accent-clay-500"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-earth-400 text-xs">
            Strength: {toolSettings.strength.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.01}
            max={1}
            step={0.01}
            value={toolSettings.strength}
            onChange={(e) => setToolSettings({ strength: parseFloat(e.target.value) })}
            className="w-full accent-clay-500"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-earth-400 text-xs">
            Falloff: {toolSettings.falloff.toFixed(2)}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={toolSettings.falloff}
            onChange={(e) => setToolSettings({ falloff: parseFloat(e.target.value) })}
            className="w-full accent-clay-500"
          />
        </label>
      </div>

      {/* Symmetry toggle */}
      <button
        onClick={handleSymmetryToggle}
        className={cn(
          "flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors",
          symmetry
            ? "bg-clay-600/20 border-clay-500/60 text-clay-300"
            : "bg-earth-900/40 border-earth-700/40 text-earth-400 hover:border-clay-600/40"
        )}
      >
        <span>Mirror Symmetry (X)</span>
        <span
          className={cn(
            "w-10 h-5 rounded-full transition-colors relative",
            symmetry ? "bg-clay-500" : "bg-earth-700"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              symmetry ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </span>
      </button>
    </div>
  );
}
