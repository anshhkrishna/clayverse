import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  private currentMesh: THREE.Mesh | null = null;
  private gridHelper: THREE.GridHelper | null = null;
  private animationId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // needed for screenshot
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.01,
      1000
    );
    this.camera.position.set(0, 15, 40);
    this.camera.lookAt(0, 0, 0);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 200;
    this.controls.target.set(0, 5, 0);
    this.controls.update();

    // Lighting
    this._setupLights();

    // Background
    this.setBackground(true);

    // Grid (default on)
    this.toggleGrid(true);

    // Start render loop
    this._startLoop();
  }

  private _setupLights(): void {
    // Ambient
    const ambient = new THREE.AmbientLight(0xfff5e0, 0.6);
    ambient.name = "__ambient";
    this.scene.add(ambient);

    // Key light (warm)
    const key = new THREE.DirectionalLight(0xffe8c0, 1.4);
    key.name = "__key";
    key.position.set(10, 20, 15);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 100;
    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;
    this.scene.add(key);

    // Fill light (cool)
    const fill = new THREE.DirectionalLight(0xc0d8ff, 0.6);
    fill.name = "__fill";
    fill.position.set(-8, 10, -12);
    this.scene.add(fill);

    // Rim light
    const rim = new THREE.DirectionalLight(0xffe0a0, 0.4);
    rim.name = "__rim";
    rim.position.set(0, -5, -15);
    this.scene.add(rim);
  }

  private _startLoop(): void {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      this.controls.update();
      this.render();
    };
    loop();
  }

  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }

  setMesh(geometry: THREE.BufferGeometry, material: THREE.Material): void {
    // Remove old mesh
    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
      this.currentMesh.geometry.dispose();
      if (Array.isArray(this.currentMesh.material)) {
        this.currentMesh.material.forEach((m) => m.dispose());
      } else {
        this.currentMesh.material.dispose();
      }
      this.currentMesh = null;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "clayMesh";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.currentMesh = mesh;
  }

  toggleWireframe(on: boolean): void {
    if (!this.currentMesh) return;
    const mats = Array.isArray(this.currentMesh.material)
      ? this.currentMesh.material
      : [this.currentMesh.material];
    mats.forEach((m) => {
      if ("wireframe" in m) {
        (m as THREE.MeshStandardMaterial).wireframe = on;
      }
    });
  }

  toggleGrid(on: boolean): void {
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper.dispose();
      this.gridHelper = null;
    }
    if (on) {
      this.gridHelper = new THREE.GridHelper(60, 30, 0x8b7355, 0xc4a882);
      this.gridHelper.name = "__grid";
      (this.gridHelper.material as THREE.LineBasicMaterial).opacity = 0.5;
      (this.gridHelper.material as THREE.LineBasicMaterial).transparent = true;
      this.scene.add(this.gridHelper);
    }
  }

  setBackground(isDark: boolean): void {
    if (isDark) {
      this.scene.background = new THREE.Color(0x1a1410);
      this.scene.fog = new THREE.Fog(0x1a1410, 80, 200);
    } else {
      this.scene.background = new THREE.Color(0xf5ede0);
      this.scene.fog = new THREE.Fog(0xf5ede0, 80, 200);
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  onResize(): void {
    const canvas = this.canvas;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  screenshot(): string {
    this.render();
    return this.renderer.domElement.toDataURL("image/png");
  }

  setCameraPreset(preset: "front" | "side" | "top" | "perspective"): void {
    const presets: Record<string, [number, number, number]> = {
      front: [0, 10, 35],
      side: [35, 10, 0],
      top: [0, 50, 0.01],
      perspective: [20, 25, 35],
    };
    const pos = presets[preset] ?? presets.perspective;
    this.camera.position.set(...pos);
    this.controls.target.set(0, 5, 0);
    this.controls.update();
  }

  fitToMesh(): void {
    if (!this.currentMesh) return;
    const box = new THREE.Box3().setFromObject(this.currentMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let distance = maxDim / (2 * Math.tan(fov / 2));
    distance *= 1.5;

    this.camera.position.set(center.x, center.y + size.y * 0.3, center.z + distance);
    this.controls.target.copy(center);
    this.controls.update();
  }

  getMesh(): THREE.Mesh | null {
    return this.currentMesh;
  }
}
