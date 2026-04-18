import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  ModelingMode,
  ActiveTool,
  ToolSettings,
  CanvasViewState,
  Project,
  ClayBody,
  GlazeRecipe,
  SimulationResult,
} from "@/types";

interface StudioState {
  // Current project
  project: Project | null;
  isDirty: boolean;
  isSaving: boolean;

  // Canvas view
  canvasView: CanvasViewState;

  // Materials
  selectedClayBody: ClayBody | null;
  selectedGlazeRecipes: GlazeRecipe[];

  // Simulation
  simulationResult: SimulationResult | null;
  isSimulating: boolean;

  // UI panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  aiMuseOpen: boolean;
  simulationPanelOpen: boolean;
  exportPanelOpen: boolean;

  // History
  undoStack: string[]; // JSON snapshots
  redoStack: string[];

  // Actions
  setProject: (project: Project | null) => void;
  setMode: (mode: ModelingMode) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setToolSettings: (settings: Partial<ToolSettings>) => void;
  setCanvasView: (view: Partial<CanvasViewState>) => void;
  setSelectedClayBody: (body: ClayBody | null) => void;
  addGlaze: (glaze: GlazeRecipe) => void;
  removeGlaze: (id: string) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setIsSimulating: (v: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleAIMuse: () => void;
  toggleSimulationPanel: () => void;
  toggleExportPanel: () => void;
  markDirty: () => void;
  markSaved: () => void;
  pushUndoSnapshot: (snapshot: string) => void;
  undo: () => string | null;
  redo: () => string | null;
}

const defaultToolSettings: ToolSettings = {
  size: 0.5,
  strength: 0.6,
  falloff: 0.4,
  symmetry: false,
  mirrorAxis: "none",
};

const defaultCanvasView: CanvasViewState = {
  mode: "wheel",
  activeTool: "pull",
  toolSettings: defaultToolSettings,
  showGrid: true,
  showWireframe: false,
  showThicknessMap: false,
  showPhysicsWarnings: true,
  camera: { position: [0, 2, 5], target: [0, 0, 0] },
};

export const useStudioStore = create<StudioState>()(
  subscribeWithSelector((set, get) => ({
    project: null,
    isDirty: false,
    isSaving: false,
    canvasView: defaultCanvasView,
    selectedClayBody: null,
    selectedGlazeRecipes: [],
    simulationResult: null,
    isSimulating: false,
    leftPanelOpen: true,
    rightPanelOpen: true,
    aiMuseOpen: false,
    simulationPanelOpen: false,
    exportPanelOpen: false,
    undoStack: [],
    redoStack: [],

    setProject: (project) => set({ project, isDirty: false }),
    setMode: (mode) =>
      set((s) => ({
        canvasView: { ...s.canvasView, mode },
      })),
    setActiveTool: (tool) =>
      set((s) => ({
        canvasView: { ...s.canvasView, activeTool: tool },
      })),
    setToolSettings: (settings) =>
      set((s) => ({
        canvasView: {
          ...s.canvasView,
          toolSettings: { ...s.canvasView.toolSettings, ...settings },
        },
      })),
    setCanvasView: (view) =>
      set((s) => ({ canvasView: { ...s.canvasView, ...view } })),
    setSelectedClayBody: (body) => set({ selectedClayBody: body }),
    addGlaze: (glaze) =>
      set((s) => ({
        selectedGlazeRecipes: [...s.selectedGlazeRecipes.filter((g) => g.id !== glaze.id), glaze],
      })),
    removeGlaze: (id) =>
      set((s) => ({
        selectedGlazeRecipes: s.selectedGlazeRecipes.filter((g) => g.id !== id),
      })),
    setSimulationResult: (result) => set({ simulationResult: result }),
    setIsSimulating: (v) => set({ isSimulating: v }),
    toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
    toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
    toggleAIMuse: () => set((s) => ({ aiMuseOpen: !s.aiMuseOpen })),
    toggleSimulationPanel: () =>
      set((s) => ({ simulationPanelOpen: !s.simulationPanelOpen })),
    toggleExportPanel: () =>
      set((s) => ({ exportPanelOpen: !s.exportPanelOpen })),
    markDirty: () => set({ isDirty: true }),
    markSaved: () => set({ isDirty: false, isSaving: false }),
    pushUndoSnapshot: (snapshot) =>
      set((s) => ({
        undoStack: [...s.undoStack.slice(-49), snapshot],
        redoStack: [],
      })),
    undo: () => {
      const { undoStack, redoStack } = get();
      if (undoStack.length < 2) return null;
      const prev = undoStack[undoStack.length - 2];
      const current = undoStack[undoStack.length - 1];
      set({
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, current],
      });
      return prev;
    },
    redo: () => {
      const { undoStack, redoStack } = get();
      if (redoStack.length === 0) return null;
      const next = redoStack[redoStack.length - 1];
      set({
        undoStack: [...undoStack, next],
        redoStack: redoStack.slice(0, -1),
      });
      return next;
    },
  }))
);
