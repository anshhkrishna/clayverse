import type { ClayBody } from "@/types";

export interface ShrinkageResult {
  wetToLeatherhard: number; // %
  leatherhardToBisque: number; // %
  bisqueToGlazeFired: number; // %
  total: number; // %
  notes: string;
}

/**
 * Calculate the shrinkage breakdown for a clay body fired to a given cone.
 * Uses heuristic stage-by-stage ratios calibrated against published data for
 * each major clay type.
 */
export function calculateShrinkage(
  body: ClayBody,
  firingCone: number
): ShrinkageResult {
  // Non-fired bodies use air-dry shrinkage only
  if (
    body.type === "air_dry" ||
    body.type === "polymer" ||
    body.firingTempMax === 0
  ) {
    const total = body.shrinkageRate;
    return {
      wetToLeatherhard: +(total * 0.6).toFixed(2),
      leatherhardToBisque: +(total * 0.4).toFixed(2),
      bisqueToGlazeFired: 0,
      total: +total.toFixed(2),
      notes:
        "Air-dry or polymer clay: all shrinkage occurs during drying. No firing shrinkage.",
    };
  }

  // Effective cone (clamp to body's valid range)
  const effectiveCone = Math.min(
    Math.max(firingCone, body.coneMin),
    body.coneMax
  );

  // Cone multiplier: higher cone = marginally higher total shrinkage.
  // Approximate: cone 6 = baseline; each full cone above adds ~0.2%
  const coneAbove6 = Math.max(0, effectiveCone - 6);
  const coneBelow6 = Math.max(0, 6 - effectiveCone);
  let coneFactor = 1 + coneAbove6 * 0.018 - coneBelow6 * 0.015;

  // Porcelain shrinks more at the firing stage
  let porcelainBoost = 1.0;
  if (body.type === "porcelain") {
    porcelainBoost = 1.08;
  }

  // Grog reduces firing shrinkage linearly
  const grogReductionFactor = 1 - body.grogContent * 0.5;

  // Paper clay has differential shrinkage (fiber expands slightly during bisque
  // before burning out, reducing net dry shrinkage)
  let paperClayFactor = 1.0;
  if (body.type === "paper_clay") {
    paperClayFactor = 0.92;
  }

  const adjustedShrinkage =
    body.shrinkageRate *
    coneFactor *
    porcelainBoost *
    grogReductionFactor *
    paperClayFactor;

  // Stage ratios (empirical):
  //  Wet → Leatherhard: ~35%  of total
  //  Leatherhard → Bone Dry / Bisque: ~30% of total
  //  Bisque → Glaze Fired: ~35% of total (primarily densification)
  // Porcelain has more firing-stage shrinkage:
  const firingStageRatio =
    body.type === "porcelain" ? 0.42 : body.type === "earthenware" ? 0.28 : 0.35;
  const dryingStageRatio = 1 - firingStageRatio;
  const wetToLeatherRatio = 0.55; // of drying

  const bisqueToGlaze = +(adjustedShrinkage * firingStageRatio).toFixed(2);
  const dryingTotal = adjustedShrinkage * dryingStageRatio;
  const wetToLeather = +(dryingTotal * wetToLeatherRatio).toFixed(2);
  const leatherToBisque = +(dryingTotal * (1 - wetToLeatherRatio)).toFixed(2);
  const total = +(wetToLeather + leatherToBisque + bisqueToGlaze).toFixed(2);

  const notesParts: string[] = [];
  if (body.type === "porcelain") {
    notesParts.push("Porcelain has elevated firing-stage shrinkage; dry slowly to prevent cracking.");
  }
  if (body.grogContent > 0.15) {
    notesParts.push(`High grog content (${Math.round(body.grogContent * 100)}%) reduces overall shrinkage and improves thermal stability.`);
  }
  if (body.type === "paper_clay") {
    notesParts.push("Paper clay fiber provides differential shrinkage resistance; fiber burns out by 600°C.");
  }
  if (effectiveCone > 9) {
    notesParts.push("High-fire cone increases vitrification shrinkage. Ensure even wall thickness.");
  }
  if (firingCone < body.coneMin) {
    notesParts.push(`Warning: firing cone ${firingCone} is below this body's minimum (cone ${body.coneMin}). Underfiring will leave the body porous.`);
  }
  if (firingCone > body.coneMax) {
    notesParts.push(`Warning: firing cone ${firingCone} exceeds this body's maximum (cone ${body.coneMax}). Overfiring risks bloating and slumping.`);
  }
  if (notesParts.length === 0) {
    notesParts.push("Normal shrinkage profile for this clay body and cone range.");
  }

  return {
    wetToLeatherhard: wetToLeather,
    leatherhardToBisque: leatherToBisque,
    bisqueToGlazeFired: bisqueToGlaze,
    total,
    notes: notesParts.join(" "),
  };
}

/**
 * Apply uniform shrinkage percentage to a vertex buffer.
 * Assumes the mesh is centred at origin; vertices scale inward uniformly.
 */
export function applyShinkageToMesh(
  vertices: Float32Array,
  shrinkagePercent: number
): Float32Array {
  const scale = 1 - shrinkagePercent / 100;
  const result = new Float32Array(vertices.length);
  for (let i = 0; i < vertices.length; i++) {
    result[i] = vertices[i] * scale;
  }
  return result;
}

/**
 * Estimate final fired dimensions given a clay body.
 * Dimensions are expected in centimetres (wet / thrown state).
 */
export function estimateFinalDimensions(
  width: number,
  height: number,
  depth: number,
  body: ClayBody
): { width: number; height: number; depth: number } {
  // Use the body's nominal shrinkage rate for final dimensions
  const scale = 1 - body.shrinkageRate / 100;
  return {
    width: +( width * scale).toFixed(3),
    height: +(height * scale).toFixed(3),
    depth: +( depth * scale).toFixed(3),
  };
}
