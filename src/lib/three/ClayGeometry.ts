import * as THREE from "three";

export interface WheelParams {
  height: number;
  neckRadius: number;
  bodyRadius: number;
  footRadius: number;
  rimFlare: number;
  wallThickness: number;
}

/**
 * Creates a lathe geometry by revolving a 2D profile around the Y axis.
 * profile: array of [x, y] points (x = radius, y = height)
 */
export function createLatheGeometry(
  profile: [number, number][],
  segments: number
): THREE.BufferGeometry {
  const points = profile.map(([x, y]) => new THREE.Vector2(x, y));
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a box/slab geometry with the given dimensions.
 */
export function createSlabGeometry(
  width: number,
  height: number,
  depth: number
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth, 8, 8, 8);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Generates a vessel profile curve from wheel parameters.
 * Returns [radius, height] pairs describing the outside wall of the vessel.
 */
export function generateProfileFromParams(
  params: WheelParams
): [number, number][] {
  const {
    height,
    neckRadius,
    bodyRadius,
    footRadius,
    rimFlare,
    wallThickness,
  } = params;

  const profile: [number, number][] = [];
  const steps = 32;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = t * height;

    let r: number;
    if (t < 0.1) {
      // foot section: from footRadius upward
      const ft = t / 0.1;
      r = footRadius + (bodyRadius - footRadius) * ft * ft;
    } else if (t < 0.55) {
      // belly / body section
      const bt = (t - 0.1) / 0.45;
      r = bodyRadius + (bodyRadius - neckRadius) * 0.15 * Math.sin(bt * Math.PI);
    } else if (t < 0.85) {
      // neck / shoulder section
      const nt = (t - 0.55) / 0.3;
      r = bodyRadius - (bodyRadius - neckRadius) * nt * nt;
    } else {
      // rim section with flare
      const rt = (t - 0.85) / 0.15;
      const flareAmt = rimFlare * 0.1;
      r = neckRadius + flareAmt * rt;
    }

    profile.push([Math.max(0.1, r), y]);
  }

  // Ensure the bottom has a minimum radius at y=0
  profile[0] = [footRadius, 0];

  // Add wall thickness inner profile in reverse for a closed bottom
  const wallProfile: [number, number][] = [];
  for (let i = steps; i >= 0; i--) {
    const [outerR, y] = profile[i];
    const innerR = Math.max(0.05, outerR - wallThickness);
    wallProfile.push([innerR, y]);
  }

  return profile;
}

/**
 * Applies a coil ring deformation to the geometry at the given position.
 * Vertices near coilPos.y within the radius threshold are displaced outward.
 */
export function applyCoilSegment(
  geometry: THREE.BufferGeometry,
  coilPos: THREE.Vector3,
  radius: number
): THREE.BufferGeometry {
  const posAttr = geometry.attributes.position;
  if (!posAttr) return geometry;

  const positions = posAttr.array as Float32Array;
  const vertexCount = posAttr.count;

  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    const dy = y - coilPos.y;
    const dr = Math.sqrt(x * x + z * z);

    // Gaussian falloff based on vertical distance
    const influence = Math.exp(-(dy * dy) / (radius * radius * 0.5));

    if (influence > 0.01 && dr > 0.001) {
      // Push outward radially
      const coilBump = radius * 0.3 * influence;
      const nx = x / dr;
      const nz = z / dr;
      positions[i * 3] = x + nx * coilBump;
      positions[i * 3 + 2] = z + nz * coilBump;
    }
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Computes a per-vertex wall thickness estimate.
 * Uses a simplified ray-casting approach: for each vertex on the outer surface,
 * casts a ray inward and finds the opposing vertex.
 * Returns a Float32Array of thickness values (one per vertex).
 */
export function computeWallThickness(
  geometry: THREE.BufferGeometry
): Float32Array {
  const posAttr = geometry.attributes.position;
  if (!posAttr) return new Float32Array(0);

  const vertexCount = posAttr.count;
  const thickness = new Float32Array(vertexCount);

  const positions = posAttr.array as Float32Array;
  const normals = geometry.attributes.normal?.array as Float32Array | undefined;

  // Build a spatial lookup: for each vertex find minimum distance to any
  // other vertex on the "opposite" side (inverted normal direction)
  const defaultThickness = 0.5;

  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    let nx = 0, ny = 0, nz = 1;
    if (normals) {
      nx = normals[i * 3];
      ny = normals[i * 3 + 1];
      nz = normals[i * 3 + 2];
    }

    // Cast inward: look for vertex in -normal direction
    let minDist = Infinity;

    for (let j = 0; j < vertexCount; j++) {
      if (i === j) continue;
      const jx = positions[j * 3];
      const jy = positions[j * 3 + 1];
      const jz = positions[j * 3 + 2];

      const dx = jx - x;
      const dy = jy - y;
      const dz = jz - z;

      // Check if vertex j is in the inward (-normal) direction
      const dot = dx * (-nx) + dy * (-ny) + dz * (-nz);
      if (dot > 0) {
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDist) {
          minDist = dist;
        }
      }
    }

    thickness[i] = minDist === Infinity ? defaultThickness : minDist;
  }

  return thickness;
}
