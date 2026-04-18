/**
 * G-code generator for ceramic clay 3D printing.
 * Generates a helical extrusion path following the lathe profile.
 * No external dependencies — pure string generation.
 */

export interface GCodeParams {
  profile: [number, number][];
  layerHeight: number;       // mm
  nozzleDiameter: number;    // mm
  wallThickness: number;     // mm, number of walls = ceil(wallThickness / nozzleDiameter)
  printSpeed: number;        // mm/min
  clayBody: string;          // informational label
}

// ─── Start / End blocks ───────────────────────────────────────────────────────

function startBlock(params: GCodeParams): string[] {
  const date = new Date().toISOString();
  return [
    `; ============================================================`,
    `; Clayverse G-code Export`,
    `; Generated: ${date}`,
    `; Clay body: ${params.clayBody}`,
    `; Layer height: ${params.layerHeight} mm`,
    `; Nozzle diameter: ${params.nozzleDiameter} mm`,
    `; Wall thickness: ${params.wallThickness} mm`,
    `; Print speed: ${params.printSpeed} mm/min`,
    `; ============================================================`,
    ``,
    `; === Initialization ===`,
    `G21        ; Set units to millimeters`,
    `G90        ; Absolute positioning`,
    `G92 E0     ; Reset extrusion`,
    `M82        ; Absolute extrusion mode`,
    ``,
    `; Home axes`,
    `G28 X Y    ; Home X and Y`,
    `G28 Z      ; Home Z`,
    ``,
    `; Move to start position`,
    `G1 Z5 F1000          ; Lift nozzle`,
    `G1 X0 Y0 F3000       ; Move to center`,
    `G1 Z0.1 F500         ; Lower to first layer`,
    `G92 E0               ; Reset extrusion counter`,
    ``,
  ];
}

function endBlock(): string[] {
  return [
    ``,
    `; === End of print ===`,
    `G92 E0          ; Reset extrusion`,
    `G1 E-2 F300     ; Retract clay`,
    `G1 Z+10 F1000   ; Raise nozzle`,
    `G1 X0 Y0 F3000  ; Return to home XY`,
    `M84             ; Disable motors`,
    `; Print complete — Clayverse`,
  ];
}

// ─── Core generator ───────────────────────────────────────────────────────────

/**
 * Generate G-code for a rotationally-symmetric clay piece.
 *
 * The profile is assumed to be a set of (radius, height) pairs (r, z).
 * We generate concentric circular passes at each height, interpolating
 * the radius from the profile.
 */
export function generateGCode(params: GCodeParams): string {
  const { profile, layerHeight, nozzleDiameter, wallThickness, printSpeed } = params;

  if (profile.length < 2) {
    return "; ERROR: profile must have at least 2 points\n";
  }

  const numWalls = Math.max(1, Math.ceil(wallThickness / nozzleDiameter));

  // Sort profile by height (y / second coordinate)
  const sorted = [...profile].sort((a, b) => a[1] - b[1]);
  const minZ = sorted[0][1];
  const maxZ = sorted[sorted.length - 1][1];

  const lines: string[] = [
    ...startBlock(params),
  ];

  // Resolution for circle approximation (segments per revolution)
  const segments = 64;
  const angleStep = (2 * Math.PI) / segments;

  let extrusion = 0;
  let currentZ = minZ;
  let layerNum = 0;

  // Extrusion amount per mm of travel (simplified clay extrusion model)
  const ePerMM = (nozzleDiameter * layerHeight) / (Math.PI * (nozzleDiameter / 2) ** 2);

  while (currentZ <= maxZ + layerHeight / 2) {
    layerNum++;
    const z = Math.min(currentZ, maxZ);

    // Interpolate radius at this height from the profile
    const radius = interpolateRadius(sorted, z);
    if (radius <= 0) {
      currentZ += layerHeight;
      continue;
    }

    lines.push(`; --- Layer ${layerNum} | Z=${z.toFixed(3)} | R=${radius.toFixed(3)} ---`);
    lines.push(`G1 Z${z.toFixed(3)} F500`);

    // Print wall(s) — from inner to outer
    for (let wall = 0; wall < numWalls; wall++) {
      const wallRadius = radius - (numWalls - 1 - wall) * nozzleDiameter;
      if (wallRadius <= 0) continue;

      // Move to start of this circle (no extrusion)
      lines.push(`G1 X${wallRadius.toFixed(3)} Y0 F${printSpeed}`);

      // Circular path approximated as line segments
      for (let s = 1; s <= segments; s++) {
        const angle = s * angleStep;
        const x = wallRadius * Math.cos(angle);
        const y = wallRadius * Math.sin(angle);
        const segLen = 2 * wallRadius * Math.sin(angleStep / 2);
        extrusion += segLen * ePerMM;
        lines.push(`G1 X${x.toFixed(3)} Y${y.toFixed(3)} E${extrusion.toFixed(5)} F${printSpeed}`);
      }
    }

    currentZ += layerHeight;
  }

  lines.push(...endBlock());
  return lines.join("\n");
}

/** Linear interpolation of radius at a given Z height from the sorted profile. */
function interpolateRadius(
  sortedProfile: [number, number][],
  z: number
): number {
  const n = sortedProfile.length;

  if (z <= sortedProfile[0][1]) return sortedProfile[0][0];
  if (z >= sortedProfile[n - 1][1]) return sortedProfile[n - 1][0];

  for (let i = 0; i < n - 1; i++) {
    const [r0, z0] = sortedProfile[i];
    const [r1, z1] = sortedProfile[i + 1];
    if (z >= z0 && z <= z1) {
      const t = z1 === z0 ? 0 : (z - z0) / (z1 - z0);
      return r0 + t * (r1 - r0);
    }
  }

  return 0;
}

// ─── Download helper ──────────────────────────────────────────────────────────

/** Trigger a browser download of a .gcode file. */
export function downloadGCode(gcode: string, filename: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".gcode") ? filename : `${filename}.gcode`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Size estimate ────────────────────────────────────────────────────────────

export function estimateGCodeSize(params: GCodeParams): number {
  const { profile, layerHeight } = params;
  const sorted = [...profile].sort((a, b) => a[1] - b[1]);
  const height = sorted[sorted.length - 1][1] - sorted[0][1];
  const layers = Math.ceil(height / layerHeight);
  // ~80 chars per segment, 64 segments per layer
  return layers * 64 * 80 + 1000;
}
