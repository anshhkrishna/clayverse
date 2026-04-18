"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { SceneManager } from "@/lib/three/SceneManager";
import { createClayMaterial, createThicknessMapMaterial } from "@/lib/three/ClayMaterial";
import { computeWallThickness } from "@/lib/three/ClayGeometry";
import { useStudioStore } from "@/stores/studioStore";

interface UseCanvasEngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mesh: THREE.Mesh | null;
  setMeshGeometry: (geometry: THREE.BufferGeometry) => void;
  takeScreenshot: () => string | null;
  isReady: boolean;
  sceneManager: SceneManager | null;
}

export function useCanvasEngine(): UseCanvasEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const [sceneManagerState, setSceneManagerState] = useState<SceneManager | null>(null);
  const currentGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const currentMaterialRef = useRef<THREE.Material | null>(null);

  const { canvasView } = useStudioStore();
  const { showGrid, showWireframe, showThicknessMap } = canvasView;
  const selectedClayBody = useStudioStore((s) => s.selectedClayBody);

  // Initialize SceneManager
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sm = new SceneManager();
    sm.init(canvas);
    sceneManagerRef.current = sm;
    setSceneManagerState(sm);
    setIsReady(true);

    // Set a default mesh
    const defaultGeometry = new THREE.CylinderGeometry(3, 4, 12, 32, 8);
    defaultGeometry.computeVertexNormals();
    const defaultMaterial = createClayMaterial("#c4895a");
    sm.setMesh(defaultGeometry, defaultMaterial);
    currentGeometryRef.current = defaultGeometry;
    currentMaterialRef.current = defaultMaterial;
    setMesh(sm.getMesh());

    return () => {
      sm.dispose();
      sceneManagerRef.current = null;
      setSceneManagerState(null);
      setIsReady(false);
    };
  }, []);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(() => {
      sceneManagerRef.current?.onResize();
    });
    observer.observe(parent);

    // Initial resize
    sceneManagerRef.current?.onResize();

    return () => {
      observer.disconnect();
    };
  }, [isReady]);

  // Sync showGrid
  useEffect(() => {
    if (!isReady) return;
    sceneManagerRef.current?.toggleGrid(showGrid);
  }, [showGrid, isReady]);

  // Sync showWireframe
  useEffect(() => {
    if (!isReady) return;
    sceneManagerRef.current?.toggleWireframe(showWireframe);
  }, [showWireframe, isReady]);

  // Sync showThicknessMap
  useEffect(() => {
    if (!isReady) return;
    const sm = sceneManagerRef.current;
    if (!sm) return;

    const geo = currentGeometryRef.current;
    if (!geo) return;

    if (showThicknessMap) {
      const thickness = computeWallThickness(geo);
      const thicknessMat = createThicknessMapMaterial(thickness);
      // Attach the thickness attribute to the geometry
      const matWithAttr = thicknessMat as THREE.ShaderMaterial & {
        thicknessAttribute: THREE.BufferAttribute;
      };
      if (matWithAttr.thicknessAttribute) {
        geo.setAttribute("thickness", matWithAttr.thicknessAttribute);
      }
      sm.setMesh(geo, thicknessMat);
      currentMaterialRef.current = thicknessMat;
    } else {
      // Restore clay material
      const clayColor = selectedClayBody?.color ?? "#c4895a";
      const clayMat = createClayMaterial(clayColor);
      sm.setMesh(geo, clayMat);
      currentMaterialRef.current = clayMat;
      sm.toggleWireframe(showWireframe);
    }

    setMesh(sm.getMesh());
  }, [showThicknessMap, isReady, selectedClayBody, showWireframe]);

  const setMeshGeometry = useCallback(
    (geometry: THREE.BufferGeometry) => {
      const sm = sceneManagerRef.current;
      if (!sm) return;

      currentGeometryRef.current = geometry;

      let mat = currentMaterialRef.current;
      if (!mat) {
        const clayColor = selectedClayBody?.color ?? "#c4895a";
        mat = createClayMaterial(clayColor);
        currentMaterialRef.current = mat;
      }

      if (showThicknessMap) {
        const thickness = computeWallThickness(geometry);
        const thicknessMat = createThicknessMapMaterial(thickness);
        const matWithAttr = thicknessMat as THREE.ShaderMaterial & {
          thicknessAttribute: THREE.BufferAttribute;
        };
        if (matWithAttr.thicknessAttribute) {
          geometry.setAttribute("thickness", matWithAttr.thicknessAttribute);
        }
        sm.setMesh(geometry, thicknessMat);
        currentMaterialRef.current = thicknessMat;
      } else {
        sm.setMesh(geometry, mat);
        sm.toggleWireframe(showWireframe);
      }

      setMesh(sm.getMesh());
    },
    [selectedClayBody, showThicknessMap, showWireframe]
  );

  const takeScreenshot = useCallback((): string | null => {
    return sceneManagerRef.current?.screenshot() ?? null;
  }, []);

  return {
    canvasRef,
    mesh,
    setMeshGeometry,
    takeScreenshot,
    isReady,
    sceneManager: sceneManagerState,
  };
}
