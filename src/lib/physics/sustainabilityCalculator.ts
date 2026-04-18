import type { ClayBody } from "@/types";

export interface SustainabilityReport {
  score: number; // 0–100, higher = more sustainable
  co2EstimateKg: number;
  energyKwh: number;
  suggestions: string[];
  alternatives: { description: string; savings: string }[];
}

/**
 * Kiln CO₂ emission factors (kg CO₂ per kWh of energy delivered).
 * Electric uses grid average (US avg ~0.386 kgCO₂/kWh).
 * Gas: natural gas combustion ~0.2 kg CO₂/kWh thermal.
 * Wood: biogenic carbon — assumed 60% neutral + 40% particulate/non-biogenic.
 */
const CO2_FACTOR: Record<"electric" | "gas" | "wood", number> = {
  electric: 0.386,
  gas: 0.202,
  wood: 0.14,
};

/**
 * Approximate energy (kWh) required to fire 1 kg of clay to a given cone.
 * Higher cone = more energy. Electric kiln efficiency ~0.45.
 */
function estimateEnergyPerKg(
  cone: number,
  kiln: "electric" | "gas" | "wood"
): number {
  // Rough kWh needed to reach temperature in a well-insulated kiln per kg of ware
  // Baseline: 1 kg to cone 6 in electric ≈ 1.8 kWh (kiln is not 100% efficient)
  const coneEnergyMap: Record<number, number> = {
    [-6]: 0.8,
    [-4]: 0.9,
    [-2]: 1.0,
    [0]: 1.1,
    [2]: 1.3,
    [4]: 1.5,
    [6]: 1.8,
    [8]: 2.1,
    [10]: 2.5,
    [12]: 2.9,
  };

  // Interpolate
  const cones = Object.keys(coneEnergyMap).map(Number).sort((a, b) => a - b);
  let energy = 1.8;
  for (let i = 0; i < cones.length - 1; i++) {
    if (cone >= cones[i] && cone <= cones[i + 1]) {
      const t = (cone - cones[i]) / (cones[i + 1] - cones[i]);
      energy =
        coneEnergyMap[cones[i]] +
        t * (coneEnergyMap[cones[i + 1]] - coneEnergyMap[cones[i]]);
      break;
    }
  }
  if (cone > cones[cones.length - 1]) energy = coneEnergyMap[12];
  if (cone < cones[0]) energy = coneEnergyMap[-6];

  // Kiln efficiency factor
  const efficiencyFactor: Record<"electric" | "gas" | "wood", number> = {
    electric: 1.0, // baseline
    gas: 0.85, // gas fires faster but less controllable per kg
    wood: 1.4, // less efficient, more fuel per kg
  };

  return energy * efficiencyFactor[kiln];
}

export function calculateSustainability(params: {
  clayBody: ClayBody;
  estimatedWeightKg: number;
  firingCone: number;
  kiln: "electric" | "gas" | "wood";
}): SustainabilityReport {
  const { clayBody, estimatedWeightKg, firingCone, kiln } = params;
  const suggestions: string[] = [];
  const alternatives: { description: string; savings: string }[] = [];

  // ── No firing bodies ─────────────────────────────────────────────────────
  if (clayBody.type === "air_dry" || clayBody.type === "polymer" || clayBody.firingTempMax === 0) {
    return {
      score: 85,
      co2EstimateKg: 0,
      energyKwh: 0,
      suggestions: [
        "Air-dry and polymer clays require no kiln — excellent energy footprint.",
        "Dispose of scraps responsibly — polymer clay is not biodegradable.",
        "Use water-based acrylic finishes instead of solvent-based for lower VOC emissions.",
      ],
      alternatives: [
        {
          description: "Choose natural air-dry clay over polymer for biodegradability",
          savings: "Eliminates PVC micro-plastic waste",
        },
      ],
    };
  }

  // ── Energy and CO₂ calculation ────────────────────────────────────────────
  const energyKwhPerKg = estimateEnergyPerKg(firingCone, kiln);
  const energyKwh = energyKwhPerKg * estimatedWeightKg;
  const co2EstimateKg = energyKwh * CO2_FACTOR[kiln];

  // ── Scoring (0–100, higher = better) ──────────────────────────────────────
  // Base score starts at 70. Deductions for high energy / CO₂, additions for
  // efficient practices.
  let score = 70;

  // Kiln type
  if (kiln === "electric") {
    score += 5; // electric most controllable, less wasted energy
    suggestions.push("Use off-peak electricity hours to reduce grid carbon intensity.");
  } else if (kiln === "gas") {
    score -= 5;
    suggestions.push("Ensure kiln is well-maintained with proper combustion ratio to reduce CO output.");
  } else if (kiln === "wood") {
    score -= 8; // particulate emissions, fuel transport
    suggestions.push("Source wood fuel locally and use sustainably harvested materials. Fire with other potters to share kiln loads.");
  }

  // Cone penalty: higher cone = more energy
  if (firingCone > 9) {
    score -= 10;
    suggestions.push("High-fire clays use significantly more energy. Consider mid-fire cone 6 equivalents where possible.");
    alternatives.push({
      description: "Substitute high-fire cone 10 body with a cone 6 equivalent",
      savings: `~${(((energyKwhPerKg - estimateEnergyPerKg(6, kiln)) * estimatedWeightKg)).toFixed(1)} kWh saved per firing`,
    });
  } else if (firingCone >= 6) {
    score -= 3;
  } else {
    score += 5; // low-fire is more energy efficient
  }

  // Heavy work penalty
  if (estimatedWeightKg > 5) {
    score -= Math.min(10, Math.floor((estimatedWeightKg - 5) * 0.5));
    suggestions.push("Large or heavy pieces require proportionally more energy. Consider making thin-walled versions.");
  }

  // Paper clay slightly better (reduced waste from repairs)
  if (clayBody.type === "paper_clay") {
    score += 3;
    suggestions.push("Paper clay reduces waste from cracked pieces — good for sustainability.");
  }

  // Grog content: recycled grog is better
  if (clayBody.grogContent > 0.2) {
    score += 2;
    suggestions.push("High grog content may include recycled fired ceramic material — ask your clay supplier.");
  }

  // Carbon-neutral suggestions
  if (co2EstimateKg > 3) {
    suggestions.push(
      `This piece produces ~${co2EstimateKg.toFixed(1)} kg CO₂. Consider sharing a full kiln load with other potters to reduce per-piece emissions.`
    );
    alternatives.push({
      description: "Share kiln load: fire with other potters",
      savings: `Up to 50–80% reduction in per-piece CO₂ if kiln is fully loaded`,
    });
  }

  suggestions.push("Recycle all clay trimmings — wedge them back into your working stock.");
  suggestions.push("Use a well-insulated kiln and keep the lid closed during firing to reduce energy loss.");

  // Electric + renewables suggestion
  if (kiln === "electric") {
    alternatives.push({
      description: "Switch to green electricity tariff or add solar panels to studio",
      savings: "Up to 100% reduction in Scope 2 CO₂ emissions",
    });
  }

  // Clamp score
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    co2EstimateKg: +co2EstimateKg.toFixed(3),
    energyKwh: +energyKwh.toFixed(2),
    suggestions,
    alternatives,
  };
}
