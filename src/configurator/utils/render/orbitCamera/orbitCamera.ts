import type { Camera, Object3D, Raycaster } from 'three';
import { Box3, Vector2, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const ORBIT_SURFACE_CLEARANCE = 0.12;

const isGarmentMesh = (object: Object3D) => (object as { isMesh?: boolean }).isMesh === true && object.visible && object.userData?.configuratorGarment === true;

const collectGarmentMeshes = (scene: Object3D) => {
  const meshes: Object3D[] = [];
  scene.traverse((object) => {
    if (isGarmentMesh(object)) meshes.push(object);
  });
  return meshes;
};

const garmentBox = new Box3();
const clampedTarget = new Vector3();
const viewDirection = new Vector3();
const garmentCenter = new Vector3();
const garmentSize = new Vector3();
const targetOffset = new Vector3();
const cursorNdc = new Vector2();

const getGarmentBox = (scene: Object3D) => {
  garmentBox.makeEmpty();
  for (const mesh of collectGarmentMeshes(scene)) {
    garmentBox.expandByObject(mesh);
  }
  return garmentBox;
};

const resolveGarmentCenter = (scene: Object3D, target: Vector3): boolean => {
  const box = getGarmentBox(scene);
  if (box.isEmpty()) return false;
  box.getCenter(target);
  return true;
};

interface ResolveCursorFocusPointInput {
  camera: Camera;
  controls: OrbitControlsImpl;
  scene: Object3D;
  raycaster: Raycaster;
  domElement: HTMLElement;
  clientX: number;
  clientY: number;
}

const resolveCursorFocusPoint = (
  { camera, controls, scene, raycaster, domElement, clientX, clientY }: ResolveCursorFocusPointInput,
  target: Vector3,
): boolean => {
  const rect = domElement.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  cursorNdc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(cursorNdc, camera);

  const hits = raycaster.intersectObjects(collectGarmentMeshes(scene), true);
  if (hits.length > 0) {
    target.copy(hits[0].point);
    return true;
  }

  const distance = camera.position.distanceTo(controls.target);
  target.copy(raycaster.ray.direction).multiplyScalar(distance).add(camera.position);
  return true;
};

const applyOrbitZoomAroundPoint = (
  camera: Camera,
  controls: OrbitControlsImpl,
  focus: Vector3,
  scale: number,
  minDistance: number,
  maxDistance: number,
): void => {
  const radius = camera.position.distanceTo(controls.target);
  if (radius < 1e-6) return;

  const clampedScale = Math.min(maxDistance / radius, Math.max(minDistance / radius, scale));
  camera.position.sub(focus).multiplyScalar(clampedScale).add(focus);
  controls.target.sub(focus).multiplyScalar(clampedScale).add(focus);
};

const rayBoxExitDistance = (box: Box3, origin: Vector3, dir: Vector3): number => {
  let exit = Infinity;
  if (Math.abs(dir.x) > 1e-9) exit = Math.min(exit, Math.max((box.min.x - origin.x) / dir.x, (box.max.x - origin.x) / dir.x));
  if (Math.abs(dir.y) > 1e-9) exit = Math.min(exit, Math.max((box.min.y - origin.y) / dir.y, (box.max.y - origin.y) / dir.y));
  if (Math.abs(dir.z) > 1e-9) exit = Math.min(exit, Math.max((box.min.z - origin.z) / dir.z, (box.max.z - origin.z) / dir.z));
  return exit;
};

interface OrbitClampInput {
  controls: OrbitControlsImpl;
  scene: Object3D;
}

const clampOrbitTargetToGarment = ({ controls, scene }: OrbitClampInput): boolean => {
  const box = getGarmentBox(scene);
  if (box.isEmpty()) return false;

  box.clampPoint(controls.target, clampedTarget);
  if (clampedTarget.distanceToSquared(controls.target) < 1e-12) return false;

  controls.target.copy(clampedTarget);
  return true;
};

interface RecenterOrbitTargetByZoomInput extends OrbitClampInput {
  camera: Camera;
  minDistance: number;
  maxDistance: number;
}

const recenterOrbitTargetByZoom = ({ camera, controls, scene, minDistance, maxDistance }: RecenterOrbitTargetByZoomInput): boolean => {
  const box = getGarmentBox(scene);
  if (box.isEmpty()) return false;

  box.getCenter(garmentCenter);
  box.getSize(garmentSize);
  const radius = 0.5 * garmentSize.length();

  const distance = camera.position.distanceTo(controls.target);
  const span = maxDistance - minDistance;
  const zoomT = span > 1e-6 ? Math.min(1, Math.max(0, (distance - minDistance) / span)) : 1;
  const maxOffset = (1 - zoomT) * radius;

  targetOffset.copy(controls.target).sub(garmentCenter);
  const offset = targetOffset.length();
  if (offset <= maxOffset || offset < 1e-9) return false;

  const pull = (offset - maxOffset) / offset;
  camera.position.addScaledVector(targetOffset, -pull);
  controls.target.addScaledVector(targetOffset, -pull);
  return true;
};

interface ClampOrbitCameraOutsideGarmentInput extends OrbitClampInput {
  camera: Camera;
  clearance?: number;
}

const clampOrbitCameraOutsideGarment = ({ camera, controls, scene, clearance = ORBIT_SURFACE_CLEARANCE }: ClampOrbitCameraOutsideGarmentInput): boolean => {
  const box = getGarmentBox(scene);
  if (box.isEmpty()) return false;

  box.expandByScalar(clearance);
  if (!box.containsPoint(controls.target)) return false;

  viewDirection.copy(camera.position).sub(controls.target);
  const radius = viewDirection.length();
  if (radius < 1e-6) return false;
  viewDirection.multiplyScalar(1 / radius);

  const minRadius = rayBoxExitDistance(box, controls.target, viewDirection);
  if (!Number.isFinite(minRadius) || radius >= minRadius) return false;

  camera.position.copy(controls.target).addScaledVector(viewDirection, minRadius);
  return true;
};

export {
  ORBIT_SURFACE_CLEARANCE,
  applyOrbitZoomAroundPoint,
  clampOrbitCameraOutsideGarment,
  clampOrbitTargetToGarment,
  recenterOrbitTargetByZoom,
  resolveCursorFocusPoint,
  resolveGarmentCenter,
};
