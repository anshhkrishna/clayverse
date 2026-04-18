import type { ClayBody, SimulationWarning } from "@/types";
import { generateId } from "@/lib/utils";
import type { WallAnalysisResult } from "./wallThicknessAnalyzer";

export type RiskLevel = "low" | "medium" | "high";

export interface StructuralSimResult {
  warpingRisk: RiskLevel;
  crackingRisk: RiskLevel;
  slumpRisk: RiskLevel;
  recommendations: string[];
  warnings: SimulationWarning[];
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 0.6) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

/**
 * Simulate structural integrity of a clay form using heuristic rules.
 */
export function simulateStructure(params: {
  vertices: Float32Array;
  clayBody: ClayBody;
  heightCm: number;
  baseDiameterCm: number;
  wallThicknessAnalysis: WallAnalysisResult;
}): StructuralSimResult {
  const { clayBody, heightCm, baseDiameterCm, wallThicknessAnalysis } = params;
  const warnings: SimulationWarning[] = [];
  const recommendations: string[] = [];

  const avgWall = wallThicknessAnalysis.averageThickness; // mm
  const minWall = wallThicknessAnalysis.minThickness; // mm
  const maxWall = wallThicknessAnalysis.maxThickness; // mm
  const thicknessRange = maxWall - minWall;

  // ── Aspect ratio ───────────────────────────────────────────────────────────
  const aspectRatio = baseDiameterCm > 0 ? heightCm / baseDiameterCm : 1;

  // ── Shrinkage-related risks ────────────────────────────────────────────────
  // Normalize shrinkage rate: 0 = no risk, 1 = full risk at 15%+
  const shrinkageNorm = Math.min(clayBody.shrinkageRate / 15, 1);

  // ── WARPING RISK ───────────────────────────────────────────────────────────
  // Factors: flat sections (low aspect ratio), thin walls, high shrinkage, low grog
  let warpScore = 0;

  // Flat forms warp more
  if (aspectRatio < 0.3) warpScore += 0.35;
  else if (aspectRatio < 0.6) warpScore += 0.15;

  // High shrinkage
  warpScore += shrinkageNorm * 0.25;

  // Thin walls warp more
  if (avgWall < 4) warpScore += 0.2;
  else if (avgWall < 7) warpScore += 0.1;

  // Low grog increases warping risk
  if (clayBody.grogContent < 0.05) warpScore += 0.1;

  // Large flat base
  if (baseDiameterCm > 20 && aspectRatio < 0.4) warpScore += 0.15;

  // Porcelain warps easily
  if (clayBody.type === "porcelain") warpScore += 0.12;

  // Earthenware at low fire is more stable (less vitrification)
  if (
    (clayBody.type === "earthenware" || clayBody.type === "terracotta") &&
    clayBody.coneMax <= 2
  )
    warpScore -= 0.08;

  const warpingRisk = scoreToRisk(Math.min(warpScore, 1));

  if (warpingRisk !== "low") {
    warnings.push({
      id: generateId(),
      type: "warping_risk",
      severity: warpingRisk === "high" ? "critical" : "warning",
      message: `Warping risk is ${warpingRisk}. ${
        aspectRatio < 0.3
          ? "Flat forms are prone to warping — kiln-wash a flat bat under the piece."
          : shrinkageNorm > 0.7
          ? "High-shrinkage clay body requires very even wall thickness."
          : "Ensure even thickness and slow, even drying."
      }`,
    });
    if (aspectRatio < 0.4) {
      recommendations.push(
        "Fire flat forms on a kiln shelf with kiln wash. Consider using a refractory disc to support wide bases."
      );
    }
    if (clayBody.type === "porcelain") {
      recommendations.push(
        "Porcelain warps easily — throw with even walls and dry under plastic for 24 hours before uncovering."
      );
    }
  }

  // ── CRACKING RISK ─────────────────────────────────────────────────────────
  // Factors: uneven thickness, low plasticity, rapid transitions, high shrinkage
  let crackScore = 0;

  // Uneven walls
  const relativeVariance = avgWall > 0 ? thicknessRange / avgWall : 0;
  if (relativeVariance > 1.5) crackScore += 0.35;
  else if (relativeVariance > 0.8) crackScore += 0.2;
  else if (relativeVariance > 0.4) crackScore += 0.1;

  // Low plasticity clay cracks more
  if (clayBody.plasticity < 0.5) crackScore += 0.25;
  else if (clayBody.plasticity < 0.65) crackScore += 0.1;

  // High shrinkage
  crackScore += shrinkageNorm * 0.2;

  // Thin spots
  if (wallThicknessAnalysis.thinSpots.length > 2) crackScore += 0.2;
  else if (wallThicknessAnalysis.thinSpots.length > 0) crackScore += 0.1;

  // Tall forms with thin bottoms tend to crack at base
  if (heightCm > 25 && avgWall < 5) crackScore += 0.15;

  // Paper clay resists cracking
  if (clayBody.type === "paper_clay") crackScore -= 0.15;

  const crackingRisk = scoreToRisk(Math.min(crackScore, 1));

  if (crackingRisk !== "low") {
    warnings.push({
      id: generateId(),
      type: "cracking_risk",
      severity: crackingRisk === "high" ? "critical" : "warning",
      message: `Cracking risk is ${crackingRisk}. ${
        relativeVariance > 1.0
          ? "Uneven wall thickness creates differential shrinkage stress."
          : clayBody.plasticity < 0.5
          ? "Low plasticity clay is prone to drying cracks — keep moist and dry slowly."
          : "Monitor joints and handle/spout attachment points carefully."
      }`,
    });
    if (relativeVariance > 0.8) {
      recommendations.push(
        "Work toward even wall thickness of 5–7 mm. Use a rib tool to compress and even out walls."
      );
    }
    if (clayBody.plasticity < 0.55) {
      recommendations.push(
        "Cover piece loosely with plastic and dry very slowly (3–5 days) to prevent drying cracks in this low-plasticity clay."
      );
    }
  }

  // ── SLUMP RISK ────────────────────────────────────────────────────────────
  // Factors: tall/thin forms, soft bodies (low grog), high cone, heavy walls on narrow base
  let slumpScore = 0;

  // Tall thin forms slump
  if (aspectRatio > 3 && avgWall < 6) slumpScore += 0.35;
  else if (aspectRatio > 2 && avgWall < 5) slumpScore += 0.2;
  else if (aspectRatio > 2.5) slumpScore += 0.1;

  // Very thick walls on narrow base
  if (avgWall > 12 && baseDiameterCm < 8) slumpScore += 0.2;

  // Low grog in tall forms
  if (clayBody.grogContent < 0.05 && aspectRatio > 1.5) slumpScore += 0.15;

  // Raku forms are low-fire and porous — less slump risk at low cone
  if (
    (clayBody.type === "raku" || clayBody.type === "earthenware") &&
    clayBody.coneMax <= 2
  )
    slumpScore -= 0.1;

  // Air-dry: no slump in kiln
  if (clayBody.type === "air_dry" || clayBody.type === "polymer") {
    slumpScore = 0;
  }

  const slumpRisk = scoreToRisk(Math.min(slumpScore, 1));

  if (slumpRisk !== "low") {
    warnings.push({
      id: generateId(),
      type: "structural_stress",
      severity: slumpRisk === "high" ? "critical" : "warning",
      message: `Slump risk is ${slumpRisk}. Tall or top-heavy forms may slump in the kiln during vitrification. ${
        aspectRatio > 2.5
          ? "Aspect ratio is high — consider adding a kiln support or making walls slightly thicker at mid-point."
          : "Ensure base is wide enough to support the form's height."
      }`,
    });
    if (aspectRatio > 2) {
      recommendations.push(
        "For tall forms, fire upright with adequate space around the piece. Avoid over-packing the kiln shelf."
      );
    }
    if (clayBody.grogContent < 0.05 && slumpScore > 0.35) {
      recommendations.push(
        "Consider adding 10–15% grog or switching to a sculpture body for better high-temperature rigidity."
      );
    }
  }

  // ── General recommendations ────────────────────────────────────────────────
  if (recommendations.length === 0) {
    recommendations.push(
      "Form structure looks good. Dry evenly under plastic for the first 24 hours, then uncovered."
    );
  }

  if (avgWall > 0 && avgWall < 4 && clayBody.type !== "porcelain") {
    recommendations.push(
      "Very thin walls detected. Compress clay well and ensure bisque firing is slow (below 100°C/hour) through the quartz inversion at 573°C."
    );
  }

  return {
    warpingRisk,
    crackingRisk,
    slumpRisk,
    recommendations,
    warnings,
  };
}
