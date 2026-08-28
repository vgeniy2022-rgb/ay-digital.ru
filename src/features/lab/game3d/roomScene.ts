import { SRGBColorSpace, PCFSoftShadowMap } from 'three/src/constants.js';
import { Raycaster } from 'three/src/core/Raycaster.js';
import type { Object3D } from 'three/src/core/Object3D.js';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry.js';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry.js';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry.js';
import { TorusGeometry } from 'three/src/geometries/TorusGeometry.js';
import { GridHelper } from 'three/src/helpers/GridHelper.js';
import { AmbientLight } from 'three/src/lights/AmbientLight.js';
import { PointLight } from 'three/src/lights/PointLight.js';
import { SpotLight } from 'three/src/lights/SpotLight.js';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial.js';
import type { Material } from 'three/src/materials/Material.js';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial.js';
import { Color } from 'three/src/math/Color.js';
import { Vector2 } from 'three/src/math/Vector2.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { Group } from 'three/src/objects/Group.js';
import { Mesh } from 'three/src/objects/Mesh.js';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { Fog } from 'three/src/scenes/Fog.js';
import { CanvasTexture } from 'three/src/textures/CanvasTexture.js';

export type RoomQuality = 'auto' | 'low' | 'medium' | 'high';
export type RoomModuleId = 'modern' | 'physics' | 'retro' | 'gravity';
export type ResolvedRoomQuality = Exclude<RoomQuality, 'auto'>;

export type RoomSceneOptions = {
  quality: RoomQuality;
  onReady: () => void;
  onFocus: (label: string | null) => void;
  onModule: (id: RoomModuleId) => void;
  onDoorUnlocked: () => void;
  onExit: () => void;
  onQualityResolved: (quality: ResolvedRoomQuality, fps?: number) => void;
};

export type RoomSceneController = {
  setKey: (key: 'forward' | 'back' | 'left' | 'right', pressed: boolean) => void;
  setMovement: (forward: number, right: number) => void;
  look: (deltaX: number, deltaY: number) => void;
  interact: () => void;
  setQuality: (quality: RoomQuality) => void;
  reset: () => void;
  dispose: () => void;
};

type DisposableObject = Object3D & { geometry?: { dispose: () => void }; material?: Material | Material[] };

const moduleLabels: Record<RoomModuleId, string> = {
  modern: 'POWER MODERN SYSTEM',
  physics: 'CAPTURE PHYSICS OBJECT',
  retro: 'BOOT RETRO TERMINAL',
  gravity: 'CHANGE GRAVITY CONTROL',
};

function textTexture(title: string, subtitle: string, accent = '#75a7ff') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D unavailable');
  const gradient = context.createLinearGradient(0, 0, 1024, 512);
  gradient.addColorStop(0, '#11151d');
  gradient.addColorStop(1, '#07090d');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 512);
  context.strokeStyle = accent;
  context.lineWidth = 8;
  context.strokeRect(22, 22, 980, 468);
  context.fillStyle = accent;
  context.font = '800 35px ui-monospace, monospace';
  context.fillText('SITEVL / EXPERIMENTAL SYSTEM', 58, 78);
  context.fillStyle = '#f7f8fb';
  context.font = '800 92px Inter, Arial, sans-serif';
  const lines = title.split('\n');
  lines.forEach((line, index) => context.fillText(line, 58, 208 + index * 94));
  context.fillStyle = '#8f98aa';
  context.font = '700 28px ui-monospace, monospace';
  context.fillText(subtitle, 60, 452);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function resolveAutoQuality(): ResolvedRoomQuality {
  const cores = navigator.hardwareConcurrency || 4;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 720;
  if (cores <= 4 || smallScreen) return 'low';
  if (cores >= 8 && (window.devicePixelRatio || 1) <= 2) return 'high';
  return 'medium';
}

export function mountTheRoom(mount: HTMLDivElement, options: RoomSceneOptions): RoomSceneController {
  if (!document.createElement('canvas').getContext('webgl2') && !document.createElement('canvas').getContext('webgl')) throw new Error('WEBGL_NOT_AVAILABLE');

  const scene = new Scene();
  scene.background = new Color(0x07090d);
  scene.fog = new Fog(0x07090d, 8, 32);
  const camera = new PerspectiveCamera(65, 1, .08, 80);
  camera.position.set(0, 1.62, 6.2);
  camera.rotation.order = 'YXZ';

  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.type = PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const textures: CanvasTexture[] = [];
  const interactables: Mesh[] = [];
  const moduleMeshes = new Map<RoomModuleId, Mesh>();
  const activeModules = new Set<RoomModuleId>();
  const keys = { forward: false, back: false, left: false, right: false };
  const analog = { forward: 0, right: 0 };
  const center = new Vector2(0, 0);
  const raycaster = new Raycaster();
  raycaster.far = 3.5;
  let focused: RoomModuleId | 'door' | null = null;
  let yaw = 0;
  let pitch = 0;
  let doorUnlocked = false;
  let exitCalled = false;
  let requestedQuality = options.quality;
  let resolvedQuality: ResolvedRoomQuality = requestedQuality === 'auto' ? resolveAutoQuality() : requestedQuality;
  let animationFrame = 0;
  let lastTime = performance.now();
  let fpsStartedAt = lastTime;
  let fpsFrames = 0;
  let visible = !document.hidden;
  let disposed = false;

  const room = new Group();
  scene.add(room);
  const darkMaterial = new MeshStandardMaterial({ color: 0x171b22, roughness: .82, metalness: .14 });
  const wallMaterial = new MeshStandardMaterial({ color: 0x222731, roughness: .95, metalness: .04 });
  const floorMaterial = new MeshStandardMaterial({ color: 0x0f1319, roughness: .68, metalness: .28 });
  const whiteMaterial = new MeshStandardMaterial({ color: 0xdfe4ec, roughness: .58, metalness: .18 });
  const warmMaterial = new MeshStandardMaterial({ color: 0xc5b899, roughness: .88, metalness: .03 });
  const blueMaterial = new MeshStandardMaterial({ color: 0x396fbe, emissive: 0x10284c, emissiveIntensity: .7, roughness: .44, metalness: .42 });

  const addBox = (parent: Object3D, size: [number, number, number], position: [number, number, number], material: Material, rotation: [number, number, number] = [0, 0, 0]) => {
    const mesh = new Mesh(new BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const addPanel = (parent: Object3D, title: string, subtitle: string, position: [number, number, number], scale: [number, number], rotationY = 0, accent = '#75a7ff') => {
    const texture = textTexture(title, subtitle, accent);
    textures.push(texture);
    const panel = new Mesh(new PlaneGeometry(scale[0], scale[1]), new MeshBasicMaterial({ map: texture }));
    panel.position.set(...position);
    panel.rotation.y = rotationY;
    parent.add(panel);
    return panel;
  };
  const registerModule = (id: RoomModuleId, mesh: Mesh) => {
    mesh.userData.moduleId = id;
    interactables.push(mesh);
    moduleMeshes.set(id, mesh);
  };

  addBox(room, [12, .22, 16], [0, -.12, 0], floorMaterial);
  addBox(room, [.24, 5.2, 16], [-6, 2.5, 0], wallMaterial);
  addBox(room, [.24, 5.2, 16], [6, 2.5, 0], wallMaterial);
  addBox(room, [12, .18, 16], [0, 5.1, 0], darkMaterial);
  addBox(room, [4.8, 5.2, .25], [-3.6, 2.5, -8], wallMaterial);
  addBox(room, [4.8, 5.2, .25], [3.6, 2.5, -8], wallMaterial);
  addBox(room, [2.4, 1.45, .25], [0, 4.38, -8], wallMaterial);
  const grid = new GridHelper(16, 32, 0x466d9e, 0x222d3d);
  grid.position.y = .015;
  room.add(grid);

  scene.add(new AmbientLight(0x8da7ca, .55));
  const ceilingLight = new PointLight(0xaecfff, 38, 18, 1.6);
  ceilingLight.position.set(0, 4.5, 1);
  ceilingLight.castShadow = true;
  scene.add(ceilingLight);
  const deskLight = new SpotLight(0x6ba8ff, 48, 14, .68, .5, 1.3);
  deskLight.position.set(-3, 4.4, -1.5);
  deskLight.target.position.set(-3, 1, -4.3);
  scene.add(deskLight, deskLight.target);
  const warmLight = new PointLight(0xffbe72, 22, 9, 1.6);
  warmLight.position.set(3.6, 2.8, -3.1);
  scene.add(warmLight);

  const desk = new Group();
  addBox(desk, [4.4, .2, 1.65], [-2.7, 1.22, -4.6], whiteMaterial);
  addBox(desk, [.16, 1.2, 1.35], [-4.55, .62, -4.6], darkMaterial);
  addBox(desk, [.16, 1.2, 1.35], [-.85, .62, -4.6], darkMaterial);
  addBox(desk, [2.45, 1.45, .15], [-2.7, 2.18, -5.05], darkMaterial);
  addBox(desk, [.15, .78, .15], [-2.7, 1.48, -5], darkMaterial);
  const modernScreen = addPanel(desk, 'SITEVL OS', 'MODULE 01 · PRESS E TO POWER', [-2.7, 2.18, -4.96], [2.22, 1.24], 0, '#75a7ff');
  modernScreen.position.z = -4.96;
  registerModule('modern', modernScreen);
  addBox(desk, [1.65, .07, .55], [-2.7, 1.38, -4.1], darkMaterial, [-.08, 0, 0]);
  addBox(desk, [.42, .08, .72], [-1.25, 1.38, -4.15], blueMaterial, [-.08, 0, 0]);
  scene.add(desk);

  const retroDesk = new Group();
  addBox(retroDesk, [3.2, .18, 1.45], [3.2, 1.05, -4.6], warmMaterial);
  addBox(retroDesk, [.15, 1.05, 1.2], [1.95, .5, -4.6], darkMaterial);
  addBox(retroDesk, [.15, 1.05, 1.2], [4.45, .5, -4.6], darkMaterial);
  addBox(retroDesk, [1.65, 1.65, 1.15], [3.2, 2, -4.85], warmMaterial);
  const retroScreen = addPanel(retroDesk, 'READY_\nLAB.OS', 'MODULE 03 · BOOT TERMINAL', [3.2, 2.06, -4.26], [1.28, .92], 0, '#ffd66b');
  registerModule('retro', retroScreen);
  addBox(retroDesk, [1.35, .13, .55], [3.2, 1.25, -3.95], warmMaterial, [-.1, 0, 0]);
  scene.add(retroDesk);

  const gravityRig = new Group();
  addBox(gravityRig, [1.6, .3, 1.2], [-4.55, .18, 1.25], darkMaterial);
  addBox(gravityRig, [.14, 2.5, .14], [-4.55, 1.55, 1.25], whiteMaterial);
  const gravityRing = new Mesh(new TorusGeometry(.72, .11, 14, 42), new MeshStandardMaterial({ color: 0x5fd5a1, emissive: 0x144832, emissiveIntensity: 1.1, metalness: .7, roughness: .25 }));
  gravityRing.position.set(-4.55, 2.05, 1.25);
  gravityRing.rotation.x = Math.PI / 2;
  gravityRing.userData.moduleId = 'gravity';
  gravityRig.add(gravityRing);
  registerModule('gravity', gravityRing);
  const gravityCore = new Mesh(new SphereGeometry(.28, 22, 18), blueMaterial.clone());
  gravityCore.position.copy(gravityRing.position);
  gravityRig.add(gravityCore);
  addPanel(gravityRig, 'GRAVITY\n1.0 G', 'MODULE 04 · CONTROL FIELD', [-5.84, 2.4, 1.25], [1.6, .8], Math.PI / 2, '#63d6a2');
  scene.add(gravityRig);

  const physicsObject = new Mesh(new SphereGeometry(.48, 24, 18), new MeshStandardMaterial({ color: 0x9b84ff, emissive: 0x251d62, emissiveIntensity: 1.2, metalness: .62, roughness: .2 }));
  physicsObject.position.set(4.65, .65, 2.1);
  physicsObject.userData.moduleId = 'physics';
  physicsObject.castShadow = true;
  scene.add(physicsObject);
  interactables.push(physicsObject);
  moduleMeshes.set('physics', physicsObject);
  const physicsRing = new Mesh(new TorusGeometry(.78, .045, 10, 36), new MeshBasicMaterial({ color: 0x8d7dff }));
  physicsRing.position.copy(physicsObject.position);
  physicsRing.rotation.x = Math.PI / 2;
  scene.add(physicsRing);

  addBox(room, [.9, 1.65, .12], [5.82, 1.25, -.9], darkMaterial, [0, -Math.PI / 2, 0]);
  addPanel(room, 'TERMINAL\nNODE 07', 'NETWORK STATUS · LOCAL', [5.74, 1.45, -.9], [1.35, .76], -Math.PI / 2, '#ff8dc7');
  addBox(room, [.12, .9, .55], [5.78, 1.4, 4.2], whiteMaterial, [0, -Math.PI / 2, 0]);
  addPanel(room, 'PHONE', 'LAB LINK · ONLINE', [5.69, 1.48, 4.2], [.48, .72], -Math.PI / 2, '#75a7ff');
  addPanel(room, 'SITEVL LAB', 'FOUR MODULES REQUIRED TO OPEN EXIT', [0, 3.55, -7.83], [2.25, .74], 0, '#ff745f');

  const door = addBox(room, [2.35, 3.55, .2], [0, 1.78, -7.84], new MeshStandardMaterial({ color: 0x11151c, emissive: 0x27120d, emissiveIntensity: .6, metalness: .7, roughness: .32 }));
  door.userData.moduleId = 'door';
  interactables.push(door);
  addBox(room, [2.7, .15, .45], [0, 3.66, -7.75], whiteMaterial);
  addBox(room, [.15, 3.75, .45], [-1.32, 1.86, -7.75], whiteMaterial);
  addBox(room, [.15, 3.75, .45], [1.32, 1.86, -7.75], whiteMaterial);

  const beyond = new Group();
  addBox(beyond, [12, .18, 12], [0, -.1, -13.5], darkMaterial);
  addBox(beyond, [2.6, 7.5, 1.3], [-4.2, 3.7, -13], blueMaterial);
  addBox(beyond, [3.2, 3.4, 1], [4, 1.6, -14], whiteMaterial);
  addBox(beyond, [6, 1.4, 1], [1, 5, -16], new MeshStandardMaterial({ color: 0xff8dc7, emissive: 0x40152d, emissiveIntensity: .7 }));
  addPanel(beyond, 'YOU ARE INSIDE\nTHE WEBSITE', 'EXIT LAB · SYSTEM BOUNDARY', [0, 3.2, -18], [8.2, 4.1], 0, '#75a7ff');
  scene.add(beyond);

  const applyQuality = (quality: RoomQuality, forced?: ResolvedRoomQuality, fps?: number) => {
    requestedQuality = quality;
    resolvedQuality = forced || (quality === 'auto' ? resolveAutoQuality() : quality);
    const ratios: Record<ResolvedRoomQuality, number> = { low: 1, medium: 1.35, high: 1.75 };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ratios[resolvedQuality]));
    renderer.shadowMap.enabled = resolvedQuality !== 'low';
    resize();
    options.onQualityResolved(resolvedQuality, fps);
  };
  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(mount);
  applyQuality(requestedQuality);

  const setFocus = (next: RoomModuleId | 'door' | null) => {
    if (focused === next) return;
    focused = next;
    options.onFocus(next === 'door' ? (doorUnlocked ? 'EXIT UNLOCKED · WALK THROUGH' : 'EXIT LOCKED · FIND 4 MODULES') : next ? `E · ${moduleLabels[next]}` : null);
  };
  const interact = () => {
    if (!focused || focused === 'door') return;
    if (activeModules.has(focused)) return;
    activeModules.add(focused);
    const material = moduleMeshes.get(focused)?.material;
    if (material instanceof MeshStandardMaterial) {
      material.color.set(0xc7ffe9);
      material.emissive.set(0x2a9b68);
      material.emissiveIntensity = 1.6;
    }
    options.onModule(focused);
    if (activeModules.size === 4) {
      doorUnlocked = true;
      options.onDoorUnlocked();
    }
  };

  const updateFocus = () => {
    raycaster.setFromCamera(center, camera);
    const hit = raycaster.intersectObjects(interactables, false).find((intersection) => intersection.distance <= 3.5);
    const moduleId = hit?.object.userData.moduleId as RoomModuleId | 'door' | undefined;
    setFocus(moduleId || null);
  };
  const render = (time: number) => {
    if (disposed) return;
    animationFrame = window.requestAnimationFrame(render);
    if (!visible) { lastTime = time; return; }
    const delta = Math.min(.04, Math.max(.001, (time - lastTime) / 1000));
    lastTime = time;
    const forwardInput = clampInput((keys.forward ? 1 : 0) - (keys.back ? 1 : 0) + analog.forward);
    const rightInput = clampInput((keys.right ? 1 : 0) - (keys.left ? 1 : 0) + analog.right);
    const speed = 3.15 * delta;
    const forward = new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    camera.position.addScaledVector(forward, forwardInput * speed);
    camera.position.addScaledVector(right, rightInput * speed);
    if (camera.position.z > -7.1) {
      camera.position.x = Math.max(-5.45, Math.min(5.45, camera.position.x));
      camera.position.z = Math.max(-7.1, Math.min(6.75, camera.position.z));
    } else if (!doorUnlocked) camera.position.z = -7.1;
    else if (camera.position.z > -9.1) camera.position.x = Math.max(-1.05, Math.min(1.05, camera.position.x));
    else camera.position.x = Math.max(-5, Math.min(5, camera.position.x));
    camera.position.z = Math.max(-17, camera.position.z);
    camera.position.y = 1.62 + Math.sin(time * .009) * Math.min(.018, Math.abs(forwardInput + rightInput) * .01);
    camera.rotation.set(pitch, yaw, 0);
    gravityRing.rotation.z += delta * (activeModules.has('gravity') ? 2.6 : .65);
    gravityCore.position.y = gravityRing.position.y + Math.sin(time * .0024) * .16;
    physicsObject.position.y = .65 + Math.sin(time * .0018) * .18;
    physicsRing.position.y = physicsObject.position.y;
    physicsRing.rotation.z += delta * .9;
    if (doorUnlocked) door.position.y += (5.2 - door.position.y) * Math.min(1, delta * 2.4);
    updateFocus();
    if (doorUnlocked && !exitCalled && camera.position.z < -11.2) { exitCalled = true; options.onExit(); }
    renderer.render(scene, camera);
    if (requestedQuality === 'auto') {
      fpsFrames += 1;
      if (time - fpsStartedAt > 2800) {
        const fps = fpsFrames * 1000 / (time - fpsStartedAt);
        if (fps < 34 && resolvedQuality !== 'low') applyQuality('auto', resolvedQuality === 'high' ? 'medium' : 'low', Math.round(fps));
        fpsFrames = 0;
        fpsStartedAt = time;
      }
    }
  };
  const onVisibility = () => { visible = !document.hidden; lastTime = performance.now(); };
  document.addEventListener('visibilitychange', onVisibility);
  animationFrame = window.requestAnimationFrame(render);
  options.onReady();

  const reset = () => {
    camera.position.set(0, 1.62, 6.2);
    yaw = 0;
    pitch = 0;
    setFocus(null);
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(animationFrame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((object) => {
      const disposable = object as DisposableObject;
      disposable.geometry?.dispose();
      if (Array.isArray(disposable.material)) disposable.material.forEach((material) => material.dispose());
      else disposable.material?.dispose();
    });
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };

  return {
    setKey: (key, pressed) => { keys[key] = pressed; },
    setMovement: (forwardValue, rightValue) => { analog.forward = clampInput(forwardValue); analog.right = clampInput(rightValue); },
    look: (deltaX, deltaY) => { yaw -= deltaX * .0032; pitch = Math.max(-1.12, Math.min(1.05, pitch - deltaY * .003)); },
    interact,
    setQuality: (quality) => applyQuality(quality),
    reset,
    dispose,
  };
}

function clampInput(value: number) { return Math.max(-1, Math.min(1, value)); }
