import type { ClayBody, SimulationWarning, WarningSeverity } from "@/types";
import { generateId } from "@/lib/utils";

export interface WallAnalysisResult {
  minThickness: number;
  maxThickness: number;
  averageThickness: number;
  thinSpots: { position: [number, number, number]; thickness: number }[];
  warnings: SimulationWarning[];
}

/**
 * Minimum wall thickness thresholds by clay type (mm).
 * These are conservative values for functional ware.
 */
function getMinThreshold(body: ClayBody): number {
  switch (body.type) {
    case "porcelain":
      return 2.0;
    case "paper_clay":
      return 2.0;
    case "earthenware":
    case "terracotta":
      return 4.0;
    case "raku":
      return 5.0;
    case "stoneware":
    default:
      return 3.0;
  }
}

function getMaxThreshold(body: ClayBody): number {
  // Very thick walls can cause thermal shock issues during firing
  if (body.type === "porcelain" || body.type === "paper_clay") return 25;
  return 35;
}

/**
 * Analyse wall thickness from a lathe/revolution geometry.
 *
 * Strategy for revolution solids:
 *  - Vertices at the same height (Y) with opposing X/Z positions are
 *    considered inner/outer pairs. We compute the radial distance from the
 *    axis for each vertex and treat (outer_radius − inner_radius) at each
 *    Y slice as the wall thickness there.
 *
 * For general meshes we fall back to a bounding-box heuristic that produces
 * an average estimate — a full ray-cast or signed distance field is not
 * feasible in pure TypeScript without a geometry library.
 */
export function analyzeWallThickness(
  vertices: Float32Array,
  indices: Uint32Array,
  clayBody: ClayBody
): WallAnalysisResult {
  const warnings: SimulationWarning[] = [];
  const minThreshold = getMinThreshold(clayBody);
  const maxThreshold = getMaxThreshold(clayBody);

  // Group vertices by quantised Y height (bucket width = 2mm = 0.002 m in
  // normalised coords; assume units are metres here)
  const bucketSize = 0.002;
  const buckets = new Map<number, { radii: number[]; y: number; x: number[]; z: number[] }>();

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    const radius = Math.sqrt(x * x + z * z);
    const bucket = Math.round(y / bucketSize);

    if (!buckets.has(bucket)) {
      buckets.set(bucket, { radii: [], y, x: [], z: [] });
    }
    const b = buckets.get(bucket)!;
    b.radii.push(radius);
    b.x.push(x);
    b.z.push(z);
  }

  const thicknesses: number[] = [];
  const thinSpots: { position: [number, number, number]; thickness: number }[] = [];

  for (const [, bucket] of buckets) {
    if (bucket.radii.length < 2) continue;
    const sorted = [...bucket.radii].sort((a, b) => a - b);
    const innerRadius = sorted[0];
    const outerRadius = sorted[sorted.length - 1];
    // Convert from metres to mm (* 1000) for reporting
    const thicknessMm = (outerRadius - innerRadius) * 1000;
    if (thicknessMm <= 0) continue;
    thicknesses.push(thicknessMm);

    if (thicknessMm < minThreshold) {
      // Find approximate centroid position
      const cx = bucket.x.reduce((a, b) => a + b, 0) / bucket.x.length;
      const cz = bucket.z.reduce((a, b) => a + b, 0) / bucket.z.length;
      thinSpots.push({
        position: [cx, bucket.y, cz],
        thickness: +thicknessMm.toFixed(2),
      });
    }
  }

  // Fallback if geometry is too simple / no buckets resolved
  if (thicknesses.length === 0) {
    // Estimate average thickness from bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < vertices.length; i += 3) {
      minX = Math.min(minX, vertices[i]);
      maxX = Math.max(maxX, vertices[i]);
      minY = Math.min(minY, vertices[i + 1]);
      maxY = Math.max(maxY, vertices[i + 1]);
    }
    const diameter = (maxX - minX) * 1000; // to mm
    const height = (maxY - minY) * 1000;
    const estimated = Math.min(diameter * 0.08, height * 0.05, 8);
    thicknesses.push(estimated);
  }

  const minThickness = Math.min(...thicknesses);
  const maxThickness = Math.max(...thicknesses);
  const averageThickness =
    thicknesses.reduce((a, b) => a + b, 0) / thicknesses.length;

  // Generate warnings
  if (thinSpots.length > 0) {
    const severity: WarningSeverity =
      minThickness < minThreshold * 0.5 ? "critical" : "warning";
    warnings.push({
      id: generateId(),
      type: "wall_too_thin",
      severity,
      message: `${thinSpots.length} thin spot(s) detected below ${minThreshold} mm minimum for ${clayBody.name}. Minimum measured: ${minThickness.toFixed(1)} mm.`,
      region: "varies",
    });
  }

  if (maxThickness > maxThreshold) {
    warnings.push({
      id: generateId(),
      type: "wall_too_thick",
      severity: "warning",
      message: `Maximum wall thickness ${maxThickness.toFixed(1)} mm exceeds ${maxThreshold} mm. Thick sections slow drying and risk thermal shock cracking during firing.`,
      region: "thickest section",
    });
  }

  const thicknessVariance =
    thicknesses.reduce((sum, t) => sum + Math.pow(t - averageThickness, 2), 0) /
    thicknesses.length;
  const thicknessStdDev = Math.sqrt(thicknessVariance);

  if (thicknessStdDev > averageThickness * 0.4 && thicknesses.length > 3) {
    warnings.push({
      id: generateId(),
      type: "uneven_thickness",
      severity: "warning",
      message: `High wall thickness variation detected (±${thicknessStdDev.toFixed(1)} mm). Uneven walls cause differential shrinkage and cracking risk.`,
      region: "entire form",
    });
  }

  return {
    minThickness: +minThickness.toFixed(2),
    maxThickness: +maxThickness.toFixed(2),
    averageThickness: +averageThickness.toFixed(2),
    thinSpots,
    warnings,
  };
}
