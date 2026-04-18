/**
 * SVG and DXF exporter for Clayverse profile curves.
 * No external dependencies — pure string generation.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SVGProfileOptions {
  scale?: number;
  includeGrid?: boolean;
  includeDimensions?: boolean;
  color?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileBounds(profile: [number, number][]): {
  minX: number; minY: number; maxX: number; maxY: number;
  width: number; height: number;
} {
  const xs = profile.map(([x]) => x);
  const ys = profile.map(([, y]) => y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function profileToPath(profile: [number, number][], scale: number, minX: number, minY: number, padding: number): string {
  return profile
    .map(([x, y], i) => {
      const px = (x - minX) * scale + padding;
      const py = (y - minY) * scale + padding;
      return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
}

// ─── SVG ──────────────────────────────────────────────────────────────────────

/**
 * Generate an SVG string representing the profile outline of a clay piece.
 */
export function generateSVGProfile(
  profile: [number, number][],
  options: SVGProfileOptions = {}
): string {
  const {
    scale = 10,
    includeGrid = true,
    includeDimensions = true,
    color = "#a8683b",
  } = options;

  if (profile.length < 2) return "<svg xmlns='http://www.w3.org/2000/svg'></svg>";

  const padding = 40;
  const { minX, minY, width, height } = profileBounds(profile);
  const svgW = width * scale + padding * 2;
  const svgH = height * scale + padding * 2;

  const lines: string[] = [];
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(0)}" height="${svgH.toFixed(0)}" viewBox="0 0 ${svgW.toFixed(2)} ${svgH.toFixed(2)}">`
  );

  // Background
  lines.push(`  <rect width="100%" height="100%" fill="#fdf8f4"/>`);

  // Grid
  if (includeGrid) {
    const gridStep = scale; // 1 unit = scale px
    lines.push(`  <g stroke="#d3c9b6" stroke-width="0.5" opacity="0.6">`);
    for (let gx = padding; gx <= svgW - padding; gx += gridStep) {
      lines.push(`    <line x1="${gx.toFixed(1)}" y1="${padding}" x2="${gx.toFixed(1)}" y2="${(svgH - padding).toFixed(1)}"/>`);
    }
    for (let gy = padding; gy <= svgH - padding; gy += gridStep) {
      lines.push(`    <line x1="${padding}" y1="${gy.toFixed(1)}" x2="${(svgW - padding).toFixed(1)}" y2="${gy.toFixed(1)}"/>`);
    }
    lines.push("  </g>");
  }

  // Symmetry axis (center line)
  lines.push(
    `  <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${(svgH - padding).toFixed(1)}" stroke="#b9a98e" stroke-width="1" stroke-dasharray="6,4" opacity="0.7"/>`
  );

  // Profile path
  const pathD = profileToPath(profile, scale, minX, minY, padding);
  lines.push(
    `  <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
  );

  // Dimension annotations
  if (includeDimensions) {
    const totalW = width.toFixed(1);
    const totalH = height.toFixed(1);
    // Width arrow at bottom
    const dimY = svgH - 12;
    lines.push(`  <g font-family="monospace" font-size="11" fill="#705e4a">`);
    lines.push(
      `    <line x1="${padding}" y1="${dimY}" x2="${(svgW - padding).toFixed(1)}" y2="${dimY}" stroke="#705e4a" stroke-width="1" marker-end="url(#arrow)"/>`
    );
    lines.push(`    <text x="${(svgW / 2).toFixed(1)}" y="${(dimY - 3).toFixed(1)}" text-anchor="middle">W: ${totalW} mm</text>`);
    // Height arrow at left
    lines.push(
      `    <text x="12" y="${(svgH / 2).toFixed(1)}" text-anchor="middle" transform="rotate(-90,12,${(svgH / 2).toFixed(1)})">H: ${totalH} mm</text>`
    );
    lines.push("  </g>");
  }

  // Title
  lines.push(
    `  <text x="${(svgW / 2).toFixed(1)}" y="16" font-family="Georgia,serif" font-size="13" fill="#593424" text-anchor="middle" font-weight="600">Clayverse Profile Export</text>`
  );

  lines.push("</svg>");
  return lines.join("\n");
}

// ─── DXF ──────────────────────────────────────────────────────────────────────

/**
 * Generate a minimal DXF R12 string from a profile curve.
 * Suitable for import into CAD / laser-cutting software.
 */
export function generateDXF(profile: [number, number][]): string {
  const lines: string[] = [];

  // DXF header
  lines.push("0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC");

  // ENTITIES section
  lines.push("0\nSECTION\n2\nENTITIES");

  // Draw the profile as a POLYLINE
  lines.push("0\nPOLYLINE");
  lines.push("8\nPROFILE"); // layer name
  lines.push("66\n1"); // vertices follow
  lines.push("70\n0"); // open polyline

  for (const [x, y] of profile) {
    lines.push("0\nVERTEX");
    lines.push("8\nPROFILE");
    lines.push(`10\n${x.toFixed(4)}`);
    lines.push(`20\n${y.toFixed(4)}`);
    lines.push("30\n0.0");
  }

  lines.push("0\nSEQEND");
  lines.push("0\nENDSEC");

  // EOF
  lines.push("0\nEOF");

  return lines.join("\n");
}

// ─── Download helpers ─────────────────────────────────────────────────────────

/** Trigger a browser download of an SVG file. */
export function downloadSVG(svgString: string, filename: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, filename.endsWith(".svg") ? filename : `${filename}.svg`);
}

/** Trigger a browser download of a DXF file. */
export function downloadDXF(dxfString: string, filename: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([dxfString], { type: "application/dxf" });
  triggerDownload(blob, filename.endsWith(".dxf") ? filename : `${filename}.dxf`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Size estimates ───────────────────────────────────────────────────────────

export function estimateSVGSize(profile: [number, number][]): number {
  // ~60 bytes per coordinate pair plus ~500 bytes overhead
  return profile.length * 60 + 500;
}

export function estimateDXFSize(profile: [number, number][]): number {
  return profile.length * 80 + 300;
}
