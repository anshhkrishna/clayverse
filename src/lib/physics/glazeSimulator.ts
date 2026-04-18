import type {
  ClayBody,
  FiringAtmosphere,
  GlazeEffect,
  GlazePreviewResult,
  GlazeRecipe,
  GlazeSurface,
  SimulationWarning,
} from "@/types";
import { generateId, hexToRgb, rgbToHex, clamp } from "@/lib/utils";

export interface GlazeSimResult {
  resultColor: string; // hex
  surface: GlazeSurface;
  activeEffects: GlazeEffect[];
  issues: SimulationWarning[];
  notes: string[];
}

// ── Colour-shift utilities ─────────────────────────────────────────────────

/** Blend two hex colours by a factor t (0=a, 1=b). */
function blendHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bv = Math.round(ca.b + (cb.b - ca.b) * t);
  return rgbToHex(clamp(r, 0, 255), clamp(g, 0, 255), clamp(bv, 0, 255));
}

/** Shift hue toward a target channel */
function shiftChannel(
  hex: string,
  rShift: number,
  gShift: number,
  bShift: number
): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return rgbToHex(
    clamp(c.r + rShift, 0, 255),
    clamp(c.g + gShift, 0, 255),
    clamp(c.b + bShift, 0, 255)
  );
}

/** Determine if a glaze has significant copper content by name/ingredient heuristic */
function hasCopper(glaze: GlazeRecipe): boolean {
  return glaze.ingredients.some(
    (ing) =>
      ing.material.toLowerCase().includes("copper") ||
      glaze.name.toLowerCase().includes("copper")
  );
}

function hasIron(glaze: GlazeRecipe): boolean {
  return glaze.ingredients.some(
    (ing) =>
      ing.material.toLowerCase().includes("iron") ||
      glaze.name.toLowerCase().includes("iron") ||
      glaze.name.toLowerCase().includes("temmoku") ||
      glaze.name.toLowerCase().includes("shino")
  );
}

function hasCobalt(glaze: GlazeRecipe): boolean {
  return glaze.ingredients.some(
    (ing) =>
      ing.material.toLowerCase().includes("cobalt") ||
      glaze.name.toLowerCase().includes("cobalt")
  );
}

function hasZinc(glaze: GlazeRecipe): boolean {
  return glaze.ingredients.some(
    (ing) =>
      ing.material.toLowerCase().includes("zinc") ||
      glaze.name.toLowerCase().includes("crystal")
  );
}

function hasSilicaHigh(glaze: GlazeRecipe): boolean {
  const silica = glaze.ingredients
    .filter((ing) => ing.material.toLowerCase().includes("silica"))
    .reduce((sum, ing) => sum + ing.percentage, 0);
  return silica > 30;
}

/**
 * Simulate the visual and structural outcome of a glaze under specific firing
 * conditions. Pure function — no DOM, no React.
 */
export function simulateGlaze(params: {
  glaze: GlazeRecipe;
  clayBody: ClayBody;
  firingCone: number;
  atmosphere: FiringAtmosphere;
  applicationThickness: "thin" | "medium" | "thick";
}): GlazeSimResult {
  const { glaze, clayBody, firingCone, atmosphere, applicationThickness } = params;

  const issues: SimulationWarning[] = [];
  const notes: string[] = [];
  const activeEffects: GlazeEffect[] = [];
  let resultColor = glaze.colorHex;
  let surface: GlazeSurface = glaze.surface;

  // ── 1. Cone compatibility check ───────────────────────────────────────────
  const coneTooLow = firingCone < glaze.coneMin;
  const coneTooHigh = firingCone > glaze.coneMax;

  if (coneTooLow) {
    // Underfired: matte, rough, pinholed
    surface = "matte";
    resultColor = blendHex(glaze.colorHex, "#a09080", 0.4);
    notes.push(
      `Glaze underfired (cone ${firingCone} < min cone ${glaze.coneMin}). Expect matte, underdeveloped surface with possible pinholes.`
    );
    issues.push({
      id: generateId(),
      type: "glaze_crawling",
      severity: "warning",
      message: `Underfired glaze — surface will be rough and porous. Raise kiln temperature to at least cone ${glaze.coneMin}.`,
    });
  }

  if (coneTooHigh) {
    // Overfired: running, color shift
    if (surface !== "metallic") surface = "glossy";
    activeEffects.push("running");
    resultColor = shiftChannel(glaze.colorHex, 10, 5, 0); // slight warm shift
    notes.push(
      `Glaze overfired (cone ${firingCone} > max cone ${glaze.coneMax}). Expect heavy running — ensure catch bowl is in place.`
    );
    issues.push({
      id: generateId(),
      type: "glaze_crawling",
      severity: "critical",
      message: `Overfired glaze will run. Protect kiln shelf with catch bowl. Consider reducing temperature to cone ${glaze.coneMax}.`,
    });
  }

  // ── 2. Atmosphere effects ─────────────────────────────────────────────────
  const isReduction =
    atmosphere === "reduction" ||
    atmosphere === "wood" ||
    atmosphere === "saggar" ||
    atmosphere === "pit";

  if (isReduction) {
    // Copper glazes turn red/pink in reduction
    if (hasCopper(glaze)) {
      resultColor = blendHex(resultColor, "#c8503a", 0.65);
      notes.push("Copper in reduction atmosphere: expect red/pink metallic luster (copper red effect).");
      activeEffects.push("reduction_spots");
    }
    // Iron glazes deepen and shift warm-brown in reduction
    if (hasIron(glaze)) {
      resultColor = blendHex(resultColor, "#6a3a20", 0.4);
      notes.push("Iron in reduction: shifts glaze toward warm brown/amber. Flashing and breaking effects intensified.");
      activeEffects.push("breaking");
    }
    // Cobalt stays blue but may slightly deepen
    if (hasCobalt(glaze)) {
      resultColor = blendHex(resultColor, "#1a2a80", 0.2);
      notes.push("Cobalt is stable in reduction — slight deepening of blue tone.");
    }
    // Wood/soda adds ash deposits
    if (atmosphere === "wood") {
      activeEffects.push("ash");
      notes.push("Wood firing adds natural ash deposits — expect surface variation and flashing.");
    }
  } else if (atmosphere === "oxidation" || atmosphere === "neutral") {
    // Copper fires green in oxidation
    if (hasCopper(glaze) && !resultColor.startsWith("#3")) {
      notes.push("Copper in oxidation fires emerald green.");
    }
  }

  // Soda firing handled separately (reduction-adjacent but different atmosphere value)
  if (atmosphere === "soda") {
    activeEffects.push("ash");
    notes.push("Soda firing creates orange-peel texture and flashing where soda contacts glaze.");
  }

  // ── 3. Application thickness effects ─────────────────────────────────────
  if (applicationThickness === "thick") {
    activeEffects.push("running");
    notes.push(
      "Thick application increases running risk on vertical surfaces. Wipe glaze from bottom 1.5 cm of piece."
    );
    if (surface === "matte") {
      surface = "satin"; // thick matte can become satin/glossy
      notes.push("Thick matte application may shift surface toward satin.");
    }
    // Crawling risk with thick application on smooth bisque
    if (!glaze.ingredients.some((ing) => ing.material.toLowerCase().includes("kaolin"))) {
      activeEffects.push("crawling");
      issues.push({
        id: generateId(),
        type: "glaze_crawling",
        severity: "warning",
        message: "Thick application of low-kaolin glaze risks crawling (balling up) during firing.",
      });
    }
  } else if (applicationThickness === "thin") {
    // Thin application: glaze may be too light, colour washed out
    resultColor = blendHex(resultColor, "#e8e0d4", 0.25);
    if (surface === "glossy") surface = "satin";
    notes.push("Thin application may result in colour washout and reduced gloss.");
  }

  // ── 4. Crystalline glaze special rules ────────────────────────────────────
  if (glaze.surface === "crystalline" || hasZinc(glaze)) {
    activeEffects.push("crystallization");
    notes.push(
      "Crystalline glaze requires a special firing schedule: hold at target cone for 15 minutes, then step-cool with holds at 1050°C, 1020°C, and 990°C (30 min each) for crystal growth."
    );
    if (applicationThickness !== "thick") {
      notes.push("Apply crystalline glaze thick (4–5 mm) for best crystal development.");
    }
  }

  // ── 5. Crazing / Shivering ─────────────────────────────────────────────────
  // Crazing: high silica glaze on low-silica body (coefficients don't match,
  // glaze has higher thermal expansion than clay)
  const glazeHighSilica = hasSilicaHigh(glaze);
  const bodyLowSilica =
    clayBody.type === "terracotta" ||
    (clayBody.type === "earthenware" && clayBody.coneMax <= 2);

  if (glazeHighSilica && bodyLowSilica) {
    activeEffects.push("crazing");
    issues.push({
      id: generateId(),
      type: "glaze_crawling",
      severity: "warning",
      message:
        "Crazing risk: high-silica glaze on low-silica earthenware body. The glaze will expand/contract more than the clay, creating a network of fine cracks. Consider a glaze with lower silica or fire to a higher cone.",
    });
    notes.push("Crazing is decorative in some traditions but reduces food safety — choose a glaze with compatible thermal expansion (COE match).");
  }

  // Shivering: low-expansion glaze on high-expansion body (reverse of crazing)
  const glazeLowExpansion =
    !glazeHighSilica &&
    glaze.ingredients.some((ing) => ing.material.toLowerCase().includes("lithium"));
  const bodyHighExpansion = clayBody.type === "raku" || clayBody.shrinkageRate > 13;

  if (glazeLowExpansion && bodyHighExpansion) {
    issues.push({
      id: generateId(),
      type: "glaze_shivering",
      severity: "warning",
      message:
        "Shivering risk: low-expansion glaze on high-expansion clay body. Glaze may flake off in sheets after cooling. Adjust glaze chemistry or switch to a more compatible body.",
    });
  }

  // ── 6. Atmosphere compatibility ────────────────────────────────────────────
  if (!glaze.compatibleAtmospheres.includes(atmosphere)) {
    issues.push({
      id: generateId(),
      type: "glaze_crawling",
      severity: "info",
      message: `Atmosphere "${atmosphere}" is not listed as compatible with ${glaze.name}. Results may vary.`,
    });
  }

  // ── 7. Raku-specific warnings ─────────────────────────────────────────────
  if (
    (atmosphere === "saggar" || atmosphere === "pit") &&
    clayBody.type !== "raku" &&
    clayBody.grogContent < 0.15
  ) {
    issues.push({
      id: generateId(),
      type: "cracking_risk",
      severity: "warning",
      message:
        "Post-fire reduction (raku/pit) is high thermal-shock. Use a raku clay body with at least 20% grog to survive rapid removal from kiln.",
    });
  }

  // Deduplicate effects
  const uniqueEffects = [...new Set(activeEffects)] as GlazeEffect[];

  return {
    resultColor,
    surface,
    activeEffects: uniqueEffects,
    issues,
    notes,
  };
}

/**
 * Convert a GlazeSimResult to the GlazePreviewResult shape expected by
 * SimulationResult.glazePreview.
 */
export function toGlazePreviewResult(sim: GlazeSimResult): GlazePreviewResult {
  return {
    colorResult: sim.resultColor,
    surfaceResult: sim.surface,
    activeEffects: sim.activeEffects,
    notes: sim.notes,
  };
}
