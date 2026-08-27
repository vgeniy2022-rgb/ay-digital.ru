import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { BackSide, SRGBColorSpace } from 'three/src/constants.js';
import { Float32BufferAttribute } from 'three/src/core/BufferAttribute.js';
import { BufferGeometry } from 'three/src/core/BufferGeometry.js';
import type { Object3D } from 'three/src/core/Object3D.js';
import { QuadraticBezierCurve3 } from 'three/src/extras/curves/QuadraticBezierCurve3.js';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry.js';
import { WireframeGeometry } from 'three/src/geometries/WireframeGeometry.js';
import { DirectionalLight } from 'three/src/lights/DirectionalLight.js';
import { HemisphereLight } from 'three/src/lights/HemisphereLight.js';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial.js';
import type { Material } from 'three/src/materials/Material.js';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial.js';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial.js';
import { PointsMaterial } from 'three/src/materials/PointsMaterial.js';
import { Color } from 'three/src/math/Color.js';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { Group } from 'three/src/objects/Group.js';
import { Line } from 'three/src/objects/Line.js';
import { LineSegments } from 'three/src/objects/LineSegments.js';
import { Mesh } from 'three/src/objects/Mesh.js';
import { Points } from 'three/src/objects/Points.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Scene } from 'three/src/scenes/Scene.js';

type DisposableObject = Object3D & {
  geometry?: BufferGeometry;
  material?: Material | Material[];
};

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function mountVladivostokGlobe(mount: HTMLDivElement, onReady: () => void) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.12, 3.35);

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const world = new Group();
  world.rotation.set(-0.08, -0.18, -0.08);
  scene.add(world);

  world.add(new Mesh(
    new SphereGeometry(1.035, 48, 48),
    new MeshBasicMaterial({ color: 0x3977ca, transparent: true, opacity: 0.075, side: BackSide }),
  ));

  world.add(new Mesh(
    new SphereGeometry(1, 64, 64),
    new MeshStandardMaterial({
      color: 0x08101d,
      roughness: 0.88,
      metalness: 0.12,
      emissive: 0x07162b,
      emissiveIntensity: 0.86,
    }),
  ));

  world.add(new LineSegments(
    new WireframeGeometry(new SphereGeometry(1.006, 28, 18)),
    new LineBasicMaterial({ color: 0x6ca7e7, transparent: true, opacity: 0.085 }),
  ));

  const lightPositions: number[] = [];
  const lightColors: number[] = [];
  const color = new Color();
  for (let index = 0; index < 720; index += 1) {
    const latitude = (seededRandom(index + 4) - 0.5) * Math.PI;
    const longitude = seededRandom(index + 29) * Math.PI * 2;
    const radius = 1.012 + seededRandom(index + 71) * 0.012;
    if (seededRandom(index + 97) < 0.28 && Math.abs(latitude) > 1.18) continue;

    lightPositions.push(
      radius * Math.cos(latitude) * Math.sin(longitude),
      radius * Math.sin(latitude),
      radius * Math.cos(latitude) * Math.cos(longitude),
    );
    color.set(index % 9 === 0 ? 0xf4a261 : index % 4 === 0 ? 0x78b9ff : 0xd7e8ff);
    lightColors.push(color.r, color.g, color.b);
  }

  const lightsGeometry = new BufferGeometry();
  lightsGeometry.setAttribute('position', new Float32BufferAttribute(lightPositions, 3));
  lightsGeometry.setAttribute('color', new Float32BufferAttribute(lightColors, 3));
  world.add(new Points(
    lightsGeometry,
    new PointsMaterial({ size: 0.012, vertexColors: true, transparent: true, opacity: 0.88, sizeAttenuation: true }),
  ));

  const longitudeOffset = 132;
  const latLonToVector = (latitude: number, longitude: number, radius = 1.025) => {
    const lat = degToRad(latitude);
    const lon = degToRad(longitude - longitudeOffset);
    return new Vector3(
      radius * Math.cos(lat) * Math.sin(lon),
      radius * Math.sin(lat),
      radius * Math.cos(lat) * Math.cos(lon),
    );
  };

  const vladivostok = latLonToVector(43.1155, 131.8855, 1.038);
  const marker = new Mesh(
    new SphereGeometry(0.035, 18, 18),
    new MeshBasicMaterial({ color: 0x74b9ff }),
  );
  marker.position.copy(vladivostok);
  world.add(marker);

  const markerGlow = new Mesh(
    new SphereGeometry(0.072, 18, 18),
    new MeshBasicMaterial({ color: 0x4f9df5, transparent: true, opacity: 0.18 }),
  );
  markerGlow.position.copy(vladivostok);
  world.add(markerGlow);

  [
    { latitude: 55.7558, longitude: 37.6173, color: 0x72a9ea },
    { latitude: 39.9042, longitude: 116.4074, color: 0xf0a46c },
    { latitude: 37.5665, longitude: 126.978, color: 0x67d8d2 },
    { latitude: 35.6762, longitude: 139.6503, color: 0x72a9ea },
    { latitude: 31.2304, longitude: 121.4737, color: 0xf0a46c },
    { latitude: 22.3193, longitude: 114.1694, color: 0x67d8d2 },
  ].forEach((destination) => {
    const end = latLonToVector(destination.latitude, destination.longitude, 1.03);
    const midpoint = vladivostok.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.31);
    const curve = new QuadraticBezierCurve3(vladivostok, midpoint, end);
    const geometry = new BufferGeometry().setFromPoints(curve.getPoints(72));
    world.add(new Line(
      geometry,
      new LineBasicMaterial({ color: destination.color, transparent: true, opacity: 0.42 }),
    ));
    const destinationMarker = new Mesh(
      new SphereGeometry(0.014, 10, 10),
      new MeshBasicMaterial({ color: destination.color }),
    );
    destinationMarker.position.copy(end);
    world.add(destinationMarker);
  });

  scene.add(new HemisphereLight(0x8fc5ff, 0x05070c, 1.75));
  const rim = new DirectionalLight(0x76b7ff, 2.8);
  rim.position.set(-2.2, 1.8, 2.8);
  scene.add(rim);

  const resize = () => {
    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  let visible = true;
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersectionObserver.observe(mount);

  let animationFrame = 0;
  const startTime = performance.now();
  const render = (time: number) => {
    animationFrame = window.requestAnimationFrame(render);
    if (!visible) return;
    const elapsed = (time - startTime) / 1000;
    world.rotation.y = -0.18 + Math.sin(elapsed * 0.16) * 0.035;
    markerGlow.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.12);
    renderer.render(scene, camera);
  };
  animationFrame = window.requestAnimationFrame(render);
  onReady();

  return () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    scene.traverse((object) => {
      const disposable = object as DisposableObject;
      disposable.geometry?.dispose();
      if (Array.isArray(disposable.material)) {
        disposable.material.forEach((material) => material.dispose());
      } else {
        disposable.material?.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
