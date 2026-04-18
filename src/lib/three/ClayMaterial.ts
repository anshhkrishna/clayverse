import * as THREE from "three";
import type { GlazeSurface } from "@/types";

/**
 * Creates a standard clay material with earthy roughness.
 */
export function createClayMaterial(
  colorHex: string,
  roughness: number = 0.85
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}

/**
 * Creates a glaze material with surface type controlling PBR properties.
 */
export function createGlazeMaterial(
  colorHex: string,
  surface: GlazeSurface | "matte" | "satin" | "glossy" | "crystalline"
): THREE.MeshStandardMaterial {
  const color = new THREE.Color(colorHex);

  const surfaceProps: Record<
    string,
    { roughness: number; metalness: number; envMapIntensity: number }
  > = {
    matte: { roughness: 0.9, metalness: 0.0, envMapIntensity: 0.2 },
    satin: { roughness: 0.45, metalness: 0.05, envMapIntensity: 0.6 },
    glossy: { roughness: 0.05, metalness: 0.1, envMapIntensity: 1.2 },
    crystalline: { roughness: 0.15, metalness: 0.25, envMapIntensity: 1.5 },
    textured: { roughness: 0.75, metalness: 0.0, envMapIntensity: 0.3 },
    metallic: { roughness: 0.2, metalness: 0.8, envMapIntensity: 1.8 },
  };

  const props = surfaceProps[surface] ?? surfaceProps.satin;

  return new THREE.MeshStandardMaterial({
    color,
    roughness: props.roughness,
    metalness: props.metalness,
    envMapIntensity: props.envMapIntensity,
    side: THREE.DoubleSide,
  });
}

/**
 * Creates a shader material that visualizes wall thickness as a heat map.
 * thin (< 0.3cm) = red, medium = yellow/green, thick (> 1cm) = blue
 */
export function createThicknessMapMaterial(
  thicknessData: Float32Array
): THREE.ShaderMaterial {
  // We embed thickness as a vertex attribute
  const vertexShader = /* glsl */ `
    attribute float thickness;
    varying float vThickness;
    varying vec3 vNormal;

    void main() {
      vThickness = thickness;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    varying float vThickness;
    varying vec3 vNormal;

    vec3 heatmapColor(float t) {
      // t in [0,1]: 0=red, 0.5=green, 1=blue
      float r = clamp(1.5 - abs(t * 4.0 - 1.0), 0.0, 1.0);
      float g = clamp(1.5 - abs(t * 4.0 - 2.0), 0.0, 1.0);
      float b = clamp(1.5 - abs(t * 4.0 - 3.0), 0.0, 1.0);
      return vec3(r, g, b);
    }

    void main() {
      // Map thickness: 0.2 = red (too thin), 1.5 = blue (thick)
      float thinMin = 0.2;
      float thickMax = 1.5;
      float t = clamp((vThickness - thinMin) / (thickMax - thinMin), 0.0, 1.0);

      vec3 heatColor = heatmapColor(t);

      // Simple diffuse shading
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diffuse = max(dot(vNormal, lightDir), 0.15);

      gl_FragColor = vec4(heatColor * diffuse, 1.0);
    }
  `;

  const thicknessAttr = new THREE.BufferAttribute(thicknessData, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });

  // The attribute is set on the geometry, but we expose it here
  // so the caller can attach it: geometry.setAttribute('thickness', attr)
  (material as THREE.ShaderMaterial & { thicknessAttribute: THREE.BufferAttribute }).thicknessAttribute = thicknessAttr;

  return material;
}
