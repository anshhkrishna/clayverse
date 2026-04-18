import type {
  ClayBody,
  FiringAtmosphere,
  FiringRecommendation,
  FiringScheduleStep,
  GlazeRecipe,
} from "@/types";

/**
 * Build a standard firing schedule for a given target cone and atmosphere.
 * Returns phases as FiringScheduleStep[].
 */
function buildSchedule(
  targetCone: number,
  atmosphere: FiringAtmosphere,
  isBisque: boolean
): FiringScheduleStep[] {
  // Approximate cone-to-temperature conversion (Celsius, witness cones)
  const coneToTemp: Record<number, number> = {
    [-6]: 999,
    [-5]: 1031,
    [-4]: 1050,
    [-3]: 1060,
    [-2]: 1063,
    [-1]: 1079,
    [0]: 1093,
    [1]: 1137,
    [2]: 1142,
    [3]: 1152,
    [4]: 1162,
    [5]: 1186,
    [6]: 1222,
    [7]: 1240,
    [8]: 1263,
    [9]: 1280,
    [10]: 1305,
    [11]: 1315,
    [12]: 1335,
  };
  const targetTemp = coneToTemp[targetCone] ?? 1222;

  if (isBisque) {
    const bisqueTarget = Math.min(980, targetTemp - 100);
    return [
      {
        phase: "Slow Initial Warm-Up",
        targetTemp: 120,
        rate: 50,
        holdTime: 30,
      },
      {
        phase: "Water Smoking",
        targetTemp: 260,
        rate: 60,
        holdTime: 0,
      },
      {
        phase: "Quartz Inversion",
        targetTemp: 590,
        rate: 80,
        holdTime: 15,
      },
      {
        phase: "Carbon Burnout",
        targetTemp: 760,
        rate: 100,
        holdTime: 20,
      },
      {
        phase: "Bisque Soak",
        targetTemp: bisqueTarget,
        rate: 100,
        holdTime: 15,
      },
      {
        phase: "Cooling",
        targetTemp: 600,
        rate: 120,
        holdTime: 0,
      },
      {
        phase: "Quartz Inversion Cooling",
        targetTemp: 550,
        rate: 30,
        holdTime: 10,
      },
      {
        phase: "Cool to Open Kiln",
        targetTemp: 80,
        rate: 150,
        holdTime: 0,
      },
    ];
  }

  // Glaze fire
  const isHighFire = targetCone >= 9;
  const isReduction = atmosphere === "reduction" || atmosphere === "wood" || atmosphere === "soda";

  const schedule: FiringScheduleStep[] = [
    {
      phase: "Initial Warm-Up",
      targetTemp: 120,
      rate: 80,
      holdTime: 0,
    },
    {
      phase: "Quartz Inversion",
      targetTemp: 590,
      rate: 100,
      holdTime: 0,
    },
    {
      phase: "Early Glaze Melt",
      targetTemp: 900,
      rate: isHighFire ? 150 : 120,
      holdTime: 0,
    },
  ];

  // Reduction start (applies atmosphere before glaze fully seals)
  if (isReduction) {
    schedule.push({
      phase: "Begin Reduction Atmosphere",
      targetTemp: 1000,
      rate: 100,
      holdTime: 10,
    });
  }

  schedule.push({
    phase: "Climbing to Cone",
    targetTemp: targetTemp - 50,
    rate: isHighFire ? 80 : 100,
    holdTime: 0,
  });

  schedule.push({
    phase: "Final Soak at Cone",
    targetTemp: targetTemp,
    rate: 30,
    holdTime: isHighFire ? 20 : 15,
  });

  // Crystalline hold
  if (targetCone >= 9) {
    schedule.push({
      phase: "Crystal Growth Hold 1050°C",
      targetTemp: 1050,
      rate: 60,
      holdTime: 30,
    });
    schedule.push({
      phase: "Crystal Growth Hold 990°C",
      targetTemp: 990,
      rate: 30,
      holdTime: 30,
    });
  }

  // End reduction
  if (isReduction) {
    schedule.push({
      phase: "End Reduction / Clear Atmosphere",
      targetTemp: targetTemp - 50,
      rate: 60,
      holdTime: 10,
    });
  }

  schedule.push({
    phase: "Cooling — Glaze Set",
    targetTemp: 600,
    rate: 150,
    holdTime: 0,
  });

  schedule.push({
    phase: "Quartz Inversion Cooling",
    targetTemp: 550,
    rate: 25,
    holdTime: 0,
  });

  schedule.push({
    phase: "Cool to Open Kiln",
    targetTemp: 80,
    rate: 200,
    holdTime: 0,
  });

  return schedule;
}

/**
 * Predict the optimal firing parameters and schedule for a clay/glaze combination.
 */
export function predictFiring(params: {
  clayBody: ClayBody;
  glazes: GlazeRecipe[];
  targetCone: number;
  atmosphere: FiringAtmosphere;
}): FiringRecommendation {
  const { clayBody, glazes, targetCone, atmosphere } = params;
  const risks: string[] = [];

  // ── Determine ideal cone ──────────────────────────────────────────────────
  // Cone must satisfy both clay body and all glazes
  const clayMin = clayBody.coneMin;
  const clayMax = clayBody.coneMax;

  // For air-dry / polymer skip firing analysis
  if (clayBody.firingTempMax === 0) {
    return {
      cone: 0,
      atmosphere: "oxidation",
      schedule: [],
      predictedOutcome:
        "No kiln firing required for this clay body. Allow to air-dry or bake per manufacturer instructions.",
      risks: ["Do not fire air-dry or polymer clay in a kiln — thermal decomposition will occur."],
    };
  }

  // Glaze cone range intersection
  let glazeConeMin = -99;
  let glazeConeMax = 99;
  for (const glaze of glazes) {
    glazeConeMin = Math.max(glazeConeMin, glaze.coneMin);
    glazeConeMax = Math.min(glazeConeMax, glaze.coneMax);
  }

  // Find safe cone
  const safeMin = Math.max(clayMin, glazes.length > 0 ? glazeConeMin : clayMin);
  const safeMax = Math.min(clayMax, glazes.length > 0 ? glazeConeMax : clayMax);
  let recommendedCone = targetCone;

  if (targetCone < safeMin) {
    risks.push(
      `Target cone ${targetCone} is below the safe range (cone ${safeMin}–${safeMax}). Clay body may be underfired and remain porous.`
    );
    recommendedCone = safeMin;
  }
  if (targetCone > safeMax && safeMax >= safeMin) {
    risks.push(
      `Target cone ${targetCone} exceeds the safe range (cone ${safeMin}–${safeMax}). Glazes may run and clay body risks bloating.`
    );
    recommendedCone = safeMax;
  }

  // ── Atmosphere compatibility ───────────────────────────────────────────────
  for (const glaze of glazes) {
    if (!glaze.compatibleAtmospheres.includes(atmosphere)) {
      risks.push(
        `Glaze "${glaze.name}" is not listed as compatible with ${atmosphere} atmosphere. Unexpected colour or surface results may occur.`
      );
    }
  }

  // ── Glaze-specific risks ──────────────────────────────────────────────────
  for (const glaze of glazes) {
    // High-iron glazes risk running in reduction
    const hasHighIron = glaze.ingredients.some(
      (ing) => ing.material.toLowerCase().includes("iron") && ing.percentage > 6
    );
    if (hasHighIron && (atmosphere === "reduction" || atmosphere === "wood")) {
      risks.push(
        `Glaze "${glaze.name}" has high iron content — may run heavily in reduction. Apply thin and use a catch bowl.`
      );
    }

    // Crystalline glazes require special schedule
    const hasCrystalline = glaze.surface === "crystalline";
    if (hasCrystalline) {
      risks.push(
        `Crystalline glaze "${glaze.name}" requires a step-cooling schedule. Ensure holds are programmed into kiln controller.`
      );
    }

    // Shino risk: thick carbon trapping or underfiring
    const isShino =
      glaze.name.toLowerCase().includes("shino") ||
      glaze.ingredients.some((ing) => ing.material.toLowerCase().includes("nepheline syenite") && ing.percentage > 50);
    if (isShino) {
      risks.push(
        `Shino glaze "${glaze.name}" requires carbon trapping in reduction for best results. Fire in heavy reduction from cone 010 to cone 08, then neutral to cone.`
      );
    }

    // Bloating risk: high organic material or manganese at high cone
    const hasManganese = glaze.ingredients.some((ing) =>
      ing.material.toLowerCase().includes("manganese")
    );
    if (hasManganese && recommendedCone > 8) {
      risks.push(
        `Glaze "${glaze.name}" contains manganese dioxide, which can cause bloating above cone 8. Consider testing before committing a full load.`
      );
    }
  }

  // ── Clay body risks ───────────────────────────────────────────────────────
  if (clayBody.type === "porcelain" && recommendedCone >= 10) {
    risks.push("High-fire porcelain warps easily at cone 10+. Use kiln props and fire evenly spaced.");
  }
  if (
    (atmosphere === "wood" || atmosphere === "pit") &&
    clayBody.grogContent < 0.1 &&
    clayBody.type !== "porcelain"
  ) {
    risks.push(
      "Wood and pit firing cause thermal stress — a higher grog content (15–25%) improves survival rate."
    );
  }

  // ── Build bisque + glaze schedule ─────────────────────────────────────────
  const glazeSchedule = buildSchedule(recommendedCone, atmosphere, false);

  // ── Predicted outcome ─────────────────────────────────────────────────────
  const glazeNames = glazes.map((g) => g.name).join(", ") || "no glaze";
  const predictedOutcome = [
    `${clayBody.name} fired to cone ${recommendedCone} in ${atmosphere} atmosphere with ${glazeNames}.`,
    clayBody.type === "porcelain"
      ? "Expect fully vitrified, semi-translucent body."
      : clayBody.type === "stoneware"
      ? "Expect vitrified, durable body with rich glaze surface."
      : "Expect semi-vitrified body — use food-safe glaze for functional ware.",
    risks.length === 0
      ? "All parameters within safe range — good firing candidate."
      : `${risks.length} risk(s) noted — review before loading kiln.`,
  ].join(" ");

  return {
    cone: recommendedCone,
    atmosphere,
    schedule: glazeSchedule,
    predictedOutcome,
    risks,
  };
}
