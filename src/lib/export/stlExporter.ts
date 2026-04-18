/**
 * STL file exporter — pure TypeScript, no external dependencies.
 * Supports both binary (default) and ASCII formats.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeNormal(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number
): [number, number, number] {
  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = cx - ax, vy = cy - ay, vz = cz - az;
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / len, ny / len, nz / len];
}

// ─── Binary STL ───────────────────────────────────────────────────────────────

/**
 * Generate a binary or ASCII STL ArrayBuffer from raw geometry data.
 *
 * @param vertices  Flat Float32Array of vertex positions (x,y,z triplets)
 * @param indices   Flat Uint32Array of triangle indices (3 per triangle)
 * @param options   binary (default true), scale (default 1)
 */
export function generateSTL(
  vertices: Float32Array,
  indices: Uint32Array,
  options: { binary?: boolean; scale?: number } = {}
): ArrayBuffer {
  const { binary = true, scale = 1 } = options;
  const triangleCount = indices.length / 3;

  if (binary) {
    return generateBinarySTL(vertices, indices, scale, triangleCount);
  } else {
    return generateAsciiSTL(vertices, indices, scale, triangleCount);
  }
}

function generateBinarySTL(
  vertices: Float32Array,
  indices: Uint32Array,
  scale: number,
  triangleCount: number
): ArrayBuffer {
  // Layout: 80-byte header + 4-byte count + (50 bytes × triangles)
  const bufferSize = 80 + 4 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // 80-byte ASCII header
  const headerText = "Clayverse STL Export — clayverse.app";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerText.length ? headerText.charCodeAt(i) : 0);
  }

  // Triangle count (little-endian uint32)
  view.setUint32(80, triangleCount, true);

  let offset = 84;

  for (let t = 0; t < triangleCount; t++) {
    const i0 = indices[t * 3] * 3;
    const i1 = indices[t * 3 + 1] * 3;
    const i2 = indices[t * 3 + 2] * 3;

    const ax = vertices[i0] * scale, ay = vertices[i0 + 1] * scale, az = vertices[i0 + 2] * scale;
    const bx = vertices[i1] * scale, by = vertices[i1 + 1] * scale, bz = vertices[i1 + 2] * scale;
    const cx = vertices[i2] * scale, cy = vertices[i2 + 1] * scale, cz = vertices[i2 + 2] * scale;

    const [nx, ny, nz] = computeNormal(ax, ay, az, bx, by, bz, cx, cy, cz);

    // Normal vector (3 × float32)
    view.setFloat32(offset, nx, true); offset += 4;
    view.setFloat32(offset, ny, true); offset += 4;
    view.setFloat32(offset, nz, true); offset += 4;

    // Vertex 1
    view.setFloat32(offset, ax, true); offset += 4;
    view.setFloat32(offset, ay, true); offset += 4;
    view.setFloat32(offset, az, true); offset += 4;

    // Vertex 2
    view.setFloat32(offset, bx, true); offset += 4;
    view.setFloat32(offset, by, true); offset += 4;
    view.setFloat32(offset, bz, true); offset += 4;

    // Vertex 3
    view.setFloat32(offset, cx, true); offset += 4;
    view.setFloat32(offset, cy, true); offset += 4;
    view.setFloat32(offset, cz, true); offset += 4;

    // Attribute byte count (2 bytes, always 0)
    view.setUint16(offset, 0, true); offset += 2;
  }

  return buffer;
}

function generateAsciiSTL(
  vertices: Float32Array,
  indices: Uint32Array,
  scale: number,
  triangleCount: number
): ArrayBuffer {
  const lines: string[] = ["solid ClayverseExport"];

  for (let t = 0; t < triangleCount; t++) {
    const i0 = indices[t * 3] * 3;
    const i1 = indices[t * 3 + 1] * 3;
    const i2 = indices[t * 3 + 2] * 3;

    const ax = vertices[i0] * scale, ay = vertices[i0 + 1] * scale, az = vertices[i0 + 2] * scale;
    const bx = vertices[i1] * scale, by = vertices[i1 + 1] * scale, bz = vertices[i1 + 2] * scale;
    const cx = vertices[i2] * scale, cy = vertices[i2 + 1] * scale, cz = vertices[i2 + 2] * scale;

    const [nx, ny, nz] = computeNormal(ax, ay, az, bx, by, bz, cx, cy, cz);

    lines.push(`  facet normal ${nx.toExponential(6)} ${ny.toExponential(6)} ${nz.toExponential(6)}`);
    lines.push("    outer loop");
    lines.push(`      vertex ${ax.toExponential(6)} ${ay.toExponential(6)} ${az.toExponential(6)}`);
    lines.push(`      vertex ${bx.toExponential(6)} ${by.toExponential(6)} ${bz.toExponential(6)}`);
    lines.push(`      vertex ${cx.toExponential(6)} ${cy.toExponential(6)} ${cz.toExponential(6)}`);
    lines.push("    endloop");
    lines.push("  endfacet");
  }

  lines.push("endsolid ClayverseExport");

  const text = lines.join("\n");
  const encoder = new TextEncoder();
  return encoder.encode(text).buffer as ArrayBuffer;
}

// ─── Download helper ──────────────────────────────────────────────────────────

/**
 * Trigger a browser download of an STL file.
 * Only works in browser environments.
 */
export function downloadSTL(
  vertices: Float32Array,
  indices: Uint32Array,
  filename: string,
  options: { binary?: boolean; scale?: number } = {}
): void {
  if (typeof window === "undefined") return;

  const buffer = generateSTL(vertices, indices, options);
  const blob = new Blob([buffer], { type: "model/stl" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".stl") ? filename : `${filename}.stl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Size estimate ────────────────────────────────────────────────────────────

/** Estimate the file size in bytes before actually generating the file. */
export function estimateSTLSize(
  indices: Uint32Array,
  binary = true
): number {
  const triangles = indices.length / 3;
  if (binary) {
    return 80 + 4 + triangles * 50;
  }
  // ASCII: approximately 200 chars per facet
  return triangles * 200;
}
