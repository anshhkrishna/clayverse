// ─── Clay Body Types ──────────────────────────────────────────────────────────

export type ClayBodyType =
  | "porcelain"
  | "stoneware"
  | "earthenware"
  | "paper_clay"
  | "air_dry"
  | "polymer"
  | "printable"
  | "terracotta"
  | "raku";

export type FiringAtmosphere = "oxidation" | "reduction" | "neutral" | "soda" | "wood" | "pit" | "saggar";

export interface ClayBody {
  id: string;
  name: string;
  type: ClayBodyType;
  shrinkageRate: number; // percentage
  firingTempMin: number; // celsius
  firingTempMax: number; // celsius
  coneMin: number;
  coneMax: number;
  plasticity: number; // 0–1
  grogContent: number; // 0–1
  color: string; // hex, unfired
  firedColor: string; // hex
  description: string;
  properties: Record<string, number | string | boolean>;
}

// ─── Glaze Types ──────────────────────────────────────────────────────────────

export type GlazeSurface = "matte" | "satin" | "glossy" | "crystalline" | "textured" | "metallic";
export type GlazeEffect =
  | "none"
  | "running"
  | "breaking"
  | "crawling"
  | "crazing"
  | "crystallization"
  | "ash"
  | "reduction_spots";

export interface GlazeRecipe {
  id: string;
  name: string;
  colorHex: string;
  surface: GlazeSurface;
  effects: GlazeEffect[];
  specificGravity: number;
  coneMin: number;
  coneMax: number;
  compatibleAtmospheres: FiringAtmosphere[];
  ingredients: { material: string; percentage: number }[];
  notes: string;
  isPublic: boolean;
  authorId?: string;
}

// ─── Project / Piece Types ─────────────────────────────────────────────────────

export type ModelingMode =
  | "wheel"
  | "handbuilding"
  | "sculpting"
  | "tile"
  | "jewelry"
  | "mixed";

export type ProjectStatus = "draft" | "in_progress" | "bisque_fired" | "glaze_fired" | "finished" | "archived";

export interface ProjectLayer {
  id: string;
  name: string;
  type: "clay" | "glaze" | "decoration" | "mixed_media";
  visible: boolean;
  locked: boolean;
  opacity: number;
  data: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  mode: ModelingMode;
  clayBodyId: string;
  glazeRecipeIds: string[];
  layers: ProjectLayer[];
  status: ProjectStatus;
  tags: string[];
  isPublic: boolean;
  thumbnailUrl?: string;
  authorId: string;
  remixedFromId?: string;
  createdAt: Date;
  updatedAt: Date;
  versions: ProjectVersion[];
  simulationResults?: SimulationResult;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  label?: string;
  sceneData: string; // JSON
  createdAt: Date;
}

// ─── Physics / Simulation Types ───────────────────────────────────────────────

export interface SimulationResult {
  shrinkagePercent: number;
  estimatedFinalDimensions: { width: number; height: number; depth: number };
  warningFlags: SimulationWarning[];
  firingRecommendation: FiringRecommendation;
  glazePreview?: GlazePreviewResult;
  sustainabilityScore: number;
}

export type WarningSeverity = "info" | "warning" | "critical";

export interface SimulationWarning {
  id: string;
  type:
    | "wall_too_thin"
    | "wall_too_thick"
    | "uneven_thickness"
    | "structural_stress"
    | "cracking_risk"
    | "warping_risk"
    | "glaze_shivering"
    | "glaze_crawling"
    | "bloating";
  severity: WarningSeverity;
  message: string;
  region?: string;
}

export interface FiringRecommendation {
  cone: number;
  atmosphere: FiringAtmosphere;
  schedule: FiringScheduleStep[];
  predictedOutcome: string;
  risks: string[];
}

export interface FiringScheduleStep {
  phase: string;
  targetTemp: number;
  rate: number; // °C per hour
  holdTime: number; // minutes
}

export interface GlazePreviewResult {
  renderedTextureUrl?: string;
  colorResult: string;
  surfaceResult: GlazeSurface;
  activeEffects: GlazeEffect[];
  notes: string[];
}

// ─── Canvas / Tool Types ───────────────────────────────────────────────────────

export type WheelTool = "center" | "pull" | "flare" | "collar" | "rib" | "trim";
export type HandbuildTool = "coil" | "slab" | "pinch" | "score_slip" | "stamp" | "texture";
export type SculptTool = "push" | "pull" | "smooth" | "inflate" | "flatten" | "crease" | "subtract" | "add";
export type TileTool = "draw" | "stamp" | "sgraffito" | "repeat" | "relief";
export type JewelryTool = "ring_sizer" | "earring_sizer" | "mold_gen" | "scale" | "mirror";

export type ActiveTool =
  | WheelTool
  | HandbuildTool
  | SculptTool
  | TileTool
  | JewelryTool;

export interface ToolSettings {
  size: number;
  strength: number;
  falloff: number;
  symmetry: boolean;
  mirrorAxis: "x" | "y" | "z" | "none";
}

export interface CanvasViewState {
  mode: ModelingMode;
  activeTool: ActiveTool;
  toolSettings: ToolSettings;
  showGrid: boolean;
  showWireframe: boolean;
  showThicknessMap: boolean;
  showPhysicsWarnings: boolean;
  camera: { position: [number, number, number]; target: [number, number, number] };
}

// ─── Community Types ───────────────────────────────────────────────────────────

export type LicenseType = "cc_by" | "cc_by_sa" | "cc_by_nc" | "cc_by_nc_sa" | "all_rights" | "paid_commercial";

export interface CommunityPost {
  id: string;
  projectId: string;
  authorId: string;
  author: UserProfile;
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  likes: number;
  remixes: number;
  views: number;
  license: LicenseType;
  remixedFromId?: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  specialty: ModelingMode[];
  location?: string;
  websiteUrl?: string;
  projectCount: number;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
}

// ─── AI Muse Types ─────────────────────────────────────────────────────────────

export interface AIMuse {
  prompt: string;
  mode: ModelingMode;
  style?: string;
  referenceImageUrl?: string;
  previousProjectId?: string;
}

export interface AIMuseResponse {
  id: string;
  suggestions: AIFormSuggestion[];
  dailyPrompt?: string;
  styleNotes: string;
  technicalNotes: string;
  glazeSuggestions: string[];
}

export interface AIFormSuggestion {
  title: string;
  description: string;
  parameters: Record<string, number | string>;
  thumbnailPrompt: string;
  tags: string[];
}

// ─── Export Types ──────────────────────────────────────────────────────────────

export type ExportFormat = "stl" | "obj" | "dxf" | "svg" | "gcode" | "pdf" | "usdz";

export interface ExportOptions {
  format: ExportFormat;
  scale: number;
  applyShinkage: boolean;
  includeGlaze: boolean;
  resolution: "low" | "medium" | "high";
  units: "mm" | "cm" | "inch";
}

// ─── Studio Management Types ───────────────────────────────────────────────────

export interface ClassSession {
  id: string;
  title: string;
  educatorId: string;
  studentIds: string[];
  sharedProjectIds: string[];
  assignments: Assignment[];
  startDate: Date;
  endDate?: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  submittedProjectIds: string[];
}
