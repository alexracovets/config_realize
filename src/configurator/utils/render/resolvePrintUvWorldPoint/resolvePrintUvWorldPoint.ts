import type { BufferGeometry, Mesh, Object3D } from 'three';
import { Vector2, Vector3 } from 'three';

import type { uvPointType } from '@types';

const isGarmentMesh = (object: Object3D): object is Mesh =>
  (object as Mesh).isMesh === true && object.visible && object.userData?.configuratorGarment === true;

const targetUv = new Vector2();
const uvA = new Vector2();
const uvB = new Vector2();
const uvC = new Vector2();
const posA = new Vector3();
const posB = new Vector3();
const posC = new Vector3();
const faceNormal = new Vector3();
const edge1 = new Vector3();
const edge2 = new Vector3();

interface resolvePrintUvWorldPointInputType {
  scene: Object3D;
  meshNames: readonly string[];
  atlasUv: uvPointType;
}

interface resolvePrintUvWorldPointResultType {
  point: Vector3;
  normal: Vector3;
}

const readUv = (attr: { getX: (index: number) => number; getY: (index: number) => number }, index: number, target: Vector2) => {
  target.set(attr.getX(index), attr.getY(index));
};

const readPosition = (attr: { getX: (index: number) => number; getY: (index: number) => number; getZ: (index: number) => number }, index: number, target: Vector3) => {
  target.set(attr.getX(index), attr.getY(index), attr.getZ(index));
};

const resolveBarycentric = (point: Vector2, a: Vector2, b: Vector2, c: Vector2) => {
  const v0x = c.x - a.x;
  const v0y = c.y - a.y;
  const v1x = b.x - a.x;
  const v1y = b.y - a.y;
  const v2x = point.x - a.x;
  const v2y = point.y - a.y;

  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;

  const denom = dot00 * dot11 - dot01 * dot01;
  if (Math.abs(denom) < 1e-12) return null;

  const invDenom = 1 / denom;
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  if (u < -1e-4 || v < -1e-4 || u + v > 1 + 1e-4) return null;

  const w = 1 - u - v;
  return { u, v, w };
};

const closestUv = new Vector2();

const sampleTriangleUvDistance = (point: Vector2, a: Vector2, b: Vector2, c: Vector2) => {
  const bary = resolveBarycentric(point, a, b, c);
  if (!bary) {
    const distances = [point.distanceTo(a), point.distanceTo(b), point.distanceTo(c)];
    return Math.min(...distances);
  }

  const clampedU = Math.min(1, Math.max(0, bary.u));
  const clampedV = Math.min(1, Math.max(0, bary.v));
  const clampedW = Math.min(1, Math.max(0, 1 - clampedU - clampedV));
  const sum = clampedU + clampedV + clampedW;
  const nu = clampedU / sum;
  const nv = clampedV / sum;
  const nw = clampedW / sum;
  closestUv.set(a.x * nw + b.x * nv + c.x * nu, a.y * nw + b.y * nv + c.y * nu);

  return point.distanceTo(closestUv);
};

const localPoint = new Vector3();
const bestLocalPoint = new Vector3();
const bestLocalNormal = new Vector3();

const resolveMeshWorldPoint = (mesh: Mesh, geometry: BufferGeometry, atlasUv: uvPointType, point: Vector3, normal: Vector3): boolean => {
  const positionAttr = geometry.getAttribute('position');
  const uvAttr = geometry.getAttribute('uv');
  if (!positionAttr || !uvAttr) return false;

  targetUv.set(atlasUv.x, atlasUv.y);

  let bestDistance = Infinity;
  let hasBest = false;

  const indexAttr = geometry.index;
  const triangleCount = indexAttr ? indexAttr.count / 3 : positionAttr.count / 3;

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
    const i0 = indexAttr ? indexAttr.getX(triangleIndex * 3) : triangleIndex * 3;
    const i1 = indexAttr ? indexAttr.getX(triangleIndex * 3 + 1) : triangleIndex * 3 + 1;
    const i2 = indexAttr ? indexAttr.getX(triangleIndex * 3 + 2) : triangleIndex * 3 + 2;

    readUv(uvAttr, i0, uvA);
    readUv(uvAttr, i1, uvB);
    readUv(uvAttr, i2, uvC);

    const bary = resolveBarycentric(targetUv, uvA, uvB, uvC);
    const distance = bary ? 0 : sampleTriangleUvDistance(targetUv, uvA, uvB, uvC);

    if (distance >= bestDistance) continue;

    readPosition(positionAttr, i0, posA);
    readPosition(positionAttr, i1, posB);
    readPosition(positionAttr, i2, posC);

    const weights = bary ?? { u: 1 / 3, v: 1 / 3, w: 1 / 3 };
    localPoint.set(0, 0, 0).addScaledVector(posA, weights.w).addScaledVector(posB, weights.v).addScaledVector(posC, weights.u);

    edge1.subVectors(posB, posA);
    edge2.subVectors(posC, posA);
    faceNormal.crossVectors(edge1, edge2).normalize();

    bestDistance = distance;
    bestLocalPoint.copy(localPoint);
    bestLocalNormal.copy(faceNormal);
    hasBest = true;
  }

  if (!hasBest) return false;

  mesh.localToWorld(bestLocalPoint);
  normal.copy(bestLocalNormal).transformDirection(mesh.matrixWorld).normalize();
  point.copy(bestLocalPoint);

  return true;
};

const resolvePrintUvWorldPoint = (
  { scene, meshNames, atlasUv }: resolvePrintUvWorldPointInputType,
  point: Vector3,
  normal: Vector3,
): boolean => {
  const allowedMeshes = new Set(meshNames);
  let resolved = false;

  scene.traverse((object) => {
    if (resolved || !isGarmentMesh(object) || !allowedMeshes.has(object.name)) return;

    const geometry = object.geometry as BufferGeometry | undefined;
    if (!geometry) return;

    resolved = resolveMeshWorldPoint(object, geometry, atlasUv, point, normal);
  });

  return resolved;
};

export type { resolvePrintUvWorldPointInputType, resolvePrintUvWorldPointResultType };
export { resolvePrintUvWorldPoint };
