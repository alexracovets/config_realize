import type { Mesh, Object3D } from 'three';
import { Box3, Vector3 } from 'three';

type garmentGradientWorldFrameType = {
  origin: { x: number; y: number; z: number };
  extent: { x: number; y: number; z: number };
  dir?: { x: number; y: number; z: number };
  uvAxis?: { x: number; y: number };
};

type garmentGradientPartRefType = {
  id?: string;
  label: string;
  meshNames: string[];
};

const FALLBACK_FRAME: garmentGradientWorldFrameType = {
  origin: { x: 0, y: 0, z: 0 },
  extent: { x: 1, y: 1, z: 1 },
};

const SLEEVE_END_BAND = 0.18;
const PCA_POWER_ITERATIONS = 24;
const CAP_SLEEVE_VERTICAL_RATIO = 2.5;
const CUFF_BAND = 0.22;

const isGarmentMesh = (object: Object3D) => (object as { isMesh?: boolean }).isMesh === true && object.visible && object.userData?.configuratorGarment === true;

const isNamedMesh = (object: Object3D, names: Set<string>): object is Mesh => names.has(object.name) && (object as Mesh).isMesh === true && object.visible;

const worldBox = new Box3();
const worldCenter = new Vector3();
const worldSize = new Vector3();
const partBox = new Box3();
const partCenter = new Vector3();
const partSize = new Vector3();
const vertexWorld = new Vector3();

const frameFromBox = (box: Box3, dir?: { x: number; y: number; z: number }): garmentGradientWorldFrameType => {
  if (box.isEmpty()) return dir ? { ...FALLBACK_FRAME, dir } : FALLBACK_FRAME;

  box.getCenter(worldCenter);
  box.getSize(worldSize);

  return {
    origin: { x: worldCenter.x, y: worldCenter.y, z: worldCenter.z },
    extent: { x: Math.max(worldSize.x * 0.5, 1e-5), y: Math.max(worldSize.y * 0.5, 1e-5), z: Math.max(worldSize.z * 0.5, 1e-5) },
    ...(dir ? { dir } : {}),
  };
};

const expandBoxByMeshNames = (root: Object3D, meshNames: string[], box: Box3) => {
  const names = new Set(meshNames);
  root.traverse((object) => {
    if (isNamedMesh(object, names)) box.expandByObject(object);
  });
};

const isSleeveGarmentPart = (part: { id?: string; label: string }) => {
  const id = (part.id ?? '').toLowerCase();
  const label = part.label.trim().toLowerCase();
  return id.includes('sleeve') || label.startsWith('manica');
};

const forEachNamedMeshVertex = (root: Object3D, names: Set<string>, onVertex: (x: number, y: number, z: number) => void) => {
  root.traverse((object) => {
    if (!isNamedMesh(object, names)) return;
    const position = object.geometry?.attributes?.position;
    if (!position) return;

    object.updateWorldMatrix(true, false);
    for (let index = 0; index < position.count; index += 1) {
      vertexWorld.fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld);
      onVertex(vertexWorld.x, vertexWorld.y, vertexWorld.z);
    }
  });
};

const planarDistanceSq = (x: number, z: number, origin: { x: number; y: number; z: number }) => {
  const dx = x - origin.x;
  const dz = z - origin.z;
  return dx * dx + dz * dz;
};

const normalizeDir = (x: number, y: number, z: number) => {
  const length = Math.hypot(x, y, z);
  if (length < 1e-8) return null;
  return { x: x / length, y: y / length, z: z / length };
};

const powerLargestAxis = (
  xx: number,
  xy: number,
  xz: number,
  yy: number,
  yz: number,
  zz: number,
  start: { x: number; y: number; z: number },
  deflate?: { x: number; y: number; z: number },
) => {
  let axisX = start.x;
  let axisY = start.y;
  let axisZ = start.z;

  for (let iteration = 0; iteration < PCA_POWER_ITERATIONS; iteration += 1) {
    if (deflate) {
      const along = axisX * deflate.x + axisY * deflate.y + axisZ * deflate.z;
      axisX -= deflate.x * along;
      axisY -= deflate.y * along;
      axisZ -= deflate.z * along;
    }

    let nextX = xx * axisX + xy * axisY + xz * axisZ;
    let nextY = xy * axisX + yy * axisY + yz * axisZ;
    let nextZ = xz * axisX + yz * axisY + zz * axisZ;

    if (deflate) {
      const along = nextX * deflate.x + nextY * deflate.y + nextZ * deflate.z;
      nextX -= deflate.x * along;
      nextY -= deflate.y * along;
      nextZ -= deflate.z * along;
    }

    const next = normalizeDir(nextX, nextY, nextZ);
    if (!next) break;
    axisX = next.x;
    axisY = next.y;
    axisZ = next.z;
  }

  return { x: axisX, y: axisY, z: axisZ };
};

type worldPointType = { x: number; y: number; z: number; u?: number; v?: number };

const fitSleeveExtentToAxis = (dir: worldPointType, halfSpan: number) => {
  const l1 = Math.abs(dir.x) + Math.abs(dir.y) + Math.abs(dir.z);
  const extent = halfSpan / Math.max(l1, 1e-5);
  return { x: Math.max(extent, 1e-5), y: Math.max(extent, 1e-5), z: Math.max(extent, 1e-5) };
};

const meanPoint = (points: worldPointType[]) => {
  const count = points.length;
  const mean = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y, z: sum.z + point.z }), { x: 0, y: 0, z: 0 });
  return { x: mean.x / count, y: mean.y / count, z: mean.z / count };
};

const planeNormalFromPoints = (points: worldPointType[], fallback: worldPointType, away: worldPointType) => {
  if (points.length < 3) return fallback;

  const center = meanPoint(points);
  let xx = 0;
  let xy = 0;
  let xz = 0;
  let yy = 0;
  let yz = 0;
  let zz = 0;

  for (const point of points) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const dz = point.z - center.z;
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  }

  const count = points.length;
  xx /= count;
  xy /= count;
  xz /= count;
  yy /= count;
  yz /= count;
  zz /= count;

  const inPlane = powerLargestAxis(xx, xy, xz, yy, yz, zz, { x: 0, y: 1, z: 0 });
  const secondStart = normalizeDir(
    inPlane.y * fallback.z - inPlane.z * fallback.y,
    inPlane.z * fallback.x - inPlane.x * fallback.z,
    inPlane.x * fallback.y - inPlane.y * fallback.x,
  ) ?? { x: 0, y: 0, z: 1 };
  const second = powerLargestAxis(xx, xy, xz, yy, yz, zz, secondStart, inPlane);
  const plane = normalizeDir(
    inPlane.y * second.z - inPlane.z * second.y,
    inPlane.z * second.x - inPlane.x * second.z,
    inPlane.x * second.y - inPlane.y * second.x,
  );
  if (!plane) return fallback;
  if (plane.x * away.x + plane.y * away.y + plane.z * away.z < 0) {
    return { x: -plane.x, y: -plane.y, z: -plane.z };
  }

  return plane;
};

const collectNamedMeshBoundaryLoops = (root: Object3D, names: Set<string>) => {
  const loops: worldPointType[][] = [];

  root.traverse((object) => {
    if (!isNamedMesh(object, names)) return;
    const position = object.geometry?.attributes?.position;
    if (!position) return;

    const index = object.geometry.index;
    const triCount = index ? index.count / 3 : position.count / 3;
    const edgeUse = new Map<string, number>();
    const edgeEnds = new Map<string, [number, number]>();
    const addEdge = (a: number, b: number) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      edgeUse.set(key, (edgeUse.get(key) ?? 0) + 1);
      edgeEnds.set(key, [a, b]);
    };

    for (let tri = 0; tri < triCount; tri += 1) {
      const i0 = index ? index.getX(tri * 3) : tri * 3;
      const i1 = index ? index.getX(tri * 3 + 1) : tri * 3 + 1;
      const i2 = index ? index.getX(tri * 3 + 2) : tri * 3 + 2;
      addEdge(i0, i1);
      addEdge(i1, i2);
      addEdge(i2, i0);
    }

    const adj = new Map<number, number[]>();
    for (const [key, uses] of edgeUse) {
      if (uses !== 1) continue;
      const ends = edgeEnds.get(key);
      if (!ends) continue;
      const [a, b] = ends;
      const aNext = adj.get(a) ?? [];
      const bNext = adj.get(b) ?? [];
      aNext.push(b);
      bNext.push(a);
      adj.set(a, aNext);
      adj.set(b, bNext);
    }

    object.updateWorldMatrix(true, false);
    const uv = object.geometry.attributes.uv;
    const visited = new Set<number>();
    for (const start of adj.keys()) {
      if (visited.has(start)) continue;
      const loopIdx: number[] = [];
      let current = start;
      let previous = -1;
      while (current >= 0 && !visited.has(current)) {
        visited.add(current);
        loopIdx.push(current);
        const neighbors = adj.get(current) ?? [];
        const next = neighbors.find((vertex) => vertex !== previous && !visited.has(vertex)) ?? neighbors.find((vertex) => vertex !== previous);
        previous = current;
        current = next ?? -1;
        if (current === start) break;
      }
      if (loopIdx.length < 8) continue;

      loops.push(
        loopIdx.map((vertexIndex) => {
          vertexWorld.fromBufferAttribute(position, vertexIndex).applyMatrix4(object.matrixWorld);
          return {
            x: vertexWorld.x,
            y: vertexWorld.y,
            z: vertexWorld.z,
            ...(uv ? { u: uv.getX(vertexIndex), v: uv.getY(vertexIndex) } : {}),
          };
        }),
      );
    }
  });

  return loops;
};

const extractOuterHemArc = (loop: worldPointType[], origin: worldPointType) => {
  const dist = (point: worldPointType) => Math.sqrt(planarDistanceSq(point.x, point.z, origin));
  let minDist = Infinity;
  let maxDist = -Infinity;
  let tip = 0;
  loop.forEach((point, index) => {
    const radial = dist(point);
    if (radial < minDist) minDist = radial;
    if (radial > maxDist) {
      maxDist = radial;
      tip = index;
    }
  });

  if (!Number.isFinite(minDist) || maxDist - minDist < 1e-6) return loop;

  const cut = minDist + 0.5 * (maxDist - minDist);
  const walk = (direction: 1 | -1) => {
    const indices: number[] = [];
    for (let step = 0; step < loop.length; step += 1) {
      const index = (tip + direction * step + loop.length * 4) % loop.length;
      if (step > 0 && dist(loop[index] ?? loop[0]) < cut) break;
      indices.push(index);
    }
    return indices;
  };

  const arc = [...walk(-1).reverse(), ...walk(1).slice(1)].map((index) => loop[index]).filter((point): point is worldPointType => Boolean(point));
  return arc.length >= 6 ? arc : loop;
};

const resolveSleeveHemUvAxis = (loops: worldPointType[][], garmentOrigin: worldPointType) => {
  if (loops.length === 0) return undefined;

  const ranked = [...loops].sort((left, right) => {
    const leftMean = meanPoint(left);
    const rightMean = meanPoint(right);
    return planarDistanceSq(leftMean.x, leftMean.z, garmentOrigin) - planarDistanceSq(rightMean.x, rightMean.z, garmentOrigin);
  });
  const loop = ranked.length >= 2 ? ranked[ranked.length - 1] : ranked[0];
  if (!loop) return undefined;

  const hem = ranked.length >= 2 ? loop : extractOuterHemArc(loop, garmentOrigin);
  if (hem.length < 6 || hem.some((point) => point.u === undefined || point.v === undefined)) return undefined;

  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  let hemU = 0;
  let hemV = 0;
  for (const point of hem) {
    const u = point.u ?? 0;
    const v = point.v ?? 0;
    hemU += u;
    hemV += v;
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  hemU /= hem.length;
  hemV /= hem.length;

  const rest = loop.filter((point) => !hem.includes(point));
  const restMean = rest.length > 0 ? rest : loop;
  const restU = restMean.reduce((sum, point) => sum + (point.u ?? 0), 0) / restMean.length;
  const restV = restMean.reduce((sum, point) => sum + (point.v ?? 0), 0) / restMean.length;
  const uSpan = maxU - minU;
  const vSpan = maxV - minV;

  if (uSpan <= vSpan * 0.35) {
    return { x: hemU >= restU ? 1 : -1, y: 0 };
  }
  if (vSpan <= uSpan * 0.35) {
    return { x: 0, y: hemV >= restV ? 1 : -1 };
  }

  return undefined;
};

const resolveCuffPlaneDir = (root: Object3D, names: Set<string>, garmentOrigin: worldPointType, fallback: worldPointType) => {
  let minDist = Infinity;
  let maxDist = -Infinity;

  forEachNamedMeshVertex(root, names, (x, _y, z) => {
    const dist = Math.sqrt(planarDistanceSq(x, z, garmentOrigin));
    if (dist < minDist) minDist = dist;
    if (dist > maxDist) maxDist = dist;
  });

  if (!Number.isFinite(minDist) || maxDist - minDist < 1e-6) return fallback;

  const cuffCut = maxDist - (maxDist - minDist) * CUFF_BAND;
  const cuffPoints: worldPointType[] = [];
  forEachNamedMeshVertex(root, names, (x, y, z) => {
    if (Math.sqrt(planarDistanceSq(x, z, garmentOrigin)) < cuffCut) return;
    cuffPoints.push({ x, y, z });
  });

  if (cuffPoints.length < 3) return fallback;
  const cuff = meanPoint(cuffPoints);
  return planeNormalFromPoints(cuffPoints, fallback, {
    x: cuff.x - garmentOrigin.x,
    y: cuff.y - garmentOrigin.y,
    z: cuff.z - garmentOrigin.z,
  });
};

const resolveSleeveHemDir = (root: Object3D, names: Set<string>, garmentOrigin: worldPointType, fallback: worldPointType) => {
  const loops = collectNamedMeshBoundaryLoops(root, names);
  if (loops.length >= 2) {
    const ranked = [...loops].sort((left, right) => {
      const leftMean = meanPoint(left);
      const rightMean = meanPoint(right);
      return planarDistanceSq(leftMean.x, leftMean.z, garmentOrigin) - planarDistanceSq(rightMean.x, rightMean.z, garmentOrigin);
    });
    const armhole = ranked[0];
    const cuff = ranked[ranked.length - 1];
    if (armhole && cuff) {
      const armholeMean = meanPoint(armhole);
      const cuffMean = meanPoint(cuff);
      return planeNormalFromPoints(cuff, fallback, {
        x: cuffMean.x - armholeMean.x,
        y: cuffMean.y - armholeMean.y,
        z: cuffMean.z - armholeMean.z,
      });
    }
  }

  if (loops[0]) {
    const hem = extractOuterHemArc(loops[0], garmentOrigin);
    const hemMean = meanPoint(hem);
    return planeNormalFromPoints(hem, fallback, {
      x: hemMean.x - garmentOrigin.x,
      y: hemMean.y - garmentOrigin.y,
      z: hemMean.z - garmentOrigin.z,
    });
  }

  return resolveCuffPlaneDir(root, names, garmentOrigin, fallback);
};

const resolveSleeveGradientDir = (
  root: Object3D,
  meshNames: string[],
  center: { x: number; y: number; z: number },
  garmentOrigin: { x: number; y: number; z: number },
) => {
  const names = new Set(meshNames);
  let count = 0;
  let meanX = 0;
  let meanY = 0;
  let meanZ = 0;

  forEachNamedMeshVertex(root, names, (x, y, z) => {
    meanX += x;
    meanY += y;
    meanZ += z;
    count += 1;
  });

  const towardX = center.x - garmentOrigin.x;
  const towardZ = center.z - garmentOrigin.z;
  const fallback = (() => {
    const horizontal = Math.hypot(towardX, towardZ);
    if (horizontal < 1e-6) return { x: towardX < 0 ? -1 : 1, y: 0, z: 0 };
    return { x: towardX / horizontal, y: 0, z: towardZ / horizontal };
  })();

  if (count === 0) return fallback;

  meanX /= count;
  meanY /= count;
  meanZ /= count;

  let xx = 0;
  let xy = 0;
  let xz = 0;
  let yy = 0;
  let yz = 0;
  let zz = 0;

  forEachNamedMeshVertex(root, names, (x, y, z) => {
    const dx = x - meanX;
    const dy = y - meanY;
    const dz = z - meanZ;
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  });

  xx /= count;
  xy /= count;
  xz /= count;
  yy /= count;
  yz /= count;
  zz /= count;

  let axisX = towardX;
  let axisY = -1;
  let axisZ = towardZ;
  const axisLength = Math.hypot(axisX, axisY, axisZ);
  if (axisLength < 1e-6) {
    axisX = fallback.x;
    axisY = fallback.y;
    axisZ = fallback.z;
  } else {
    axisX /= axisLength;
    axisY /= axisLength;
    axisZ /= axisLength;
  }

  for (let iteration = 0; iteration < PCA_POWER_ITERATIONS; iteration += 1) {
    const nextX = xx * axisX + xy * axisY + xz * axisZ;
    const nextY = xy * axisX + yy * axisY + yz * axisZ;
    const nextZ = xz * axisX + yz * axisY + zz * axisZ;
    const nextLength = Math.hypot(nextX, nextY, nextZ);
    if (nextLength < 1e-8) break;
    axisX = nextX / nextLength;
    axisY = nextY / nextLength;
    axisZ = nextZ / nextLength;
  }

  if (Math.abs(axisY) > Math.hypot(axisX, axisZ) * CAP_SLEEVE_VERTICAL_RATIO) {
    const dir = resolveSleeveHemDir(root, names, garmentOrigin, fallback);
    const uvAxis = resolveSleeveHemUvAxis(collectNamedMeshBoundaryLoops(root, names), garmentOrigin);
    let minProj = Infinity;
    let maxProj = -Infinity;
    forEachNamedMeshVertex(root, names, (x, y, z) => {
      const s = x * dir.x + y * dir.y + z * dir.z;
      if (s < minProj) minProj = s;
      if (s > maxProj) maxProj = s;
    });
    if (!Number.isFinite(minProj) || maxProj - minProj < 1e-6) return fallback;

    const halfSpan = (maxProj - minProj) * 0.5;
    const midS = (minProj + maxProj) * 0.5;
    const meanS = meanX * dir.x + meanY * dir.y + meanZ * dir.z;
    const shift = midS - meanS;
    return {
      origin: { x: meanX + dir.x * shift, y: meanY + dir.y * shift, z: meanZ + dir.z * shift },
      extent: fitSleeveExtentToAxis(dir, halfSpan),
      dir,
      ...(uvAxis ? { uvAxis } : {}),
    };
  }

  let minS = Infinity;
  let maxS = -Infinity;
  forEachNamedMeshVertex(root, names, (x, y, z) => {
    const s = x * axisX + y * axisY + z * axisZ;
    if (s < minS) minS = s;
    if (s > maxS) maxS = s;
  });

  if (!Number.isFinite(minS) || maxS - minS < 1e-6) return fallback;

  const band = (maxS - minS) * SLEEVE_END_BAND;
  const lowCut = minS + band;
  const highCut = maxS - band;
  let lowX = 0;
  let lowY = 0;
  let lowZ = 0;
  let lowCount = 0;
  let highX = 0;
  let highY = 0;
  let highZ = 0;
  let highCount = 0;

  forEachNamedMeshVertex(root, names, (x, y, z) => {
    const s = x * axisX + y * axisY + z * axisZ;
    if (s <= lowCut) {
      lowX += x;
      lowY += y;
      lowZ += z;
      lowCount += 1;
    }
    if (s >= highCut) {
      highX += x;
      highY += y;
      highZ += z;
      highCount += 1;
    }
  });

  if (lowCount === 0 || highCount === 0) return fallback;

  lowX /= lowCount;
  lowY /= lowCount;
  lowZ /= lowCount;
  highX /= highCount;
  highY /= highCount;
  highZ /= highCount;

  const lowOutward = planarDistanceSq(lowX, lowZ, garmentOrigin);
  const highOutward = planarDistanceSq(highX, highZ, garmentOrigin);
  const outwardTie = Math.abs(highOutward - lowOutward) < 1e-8;
  const cuffIsHigh = outwardTie ? highY < lowY : highOutward > lowOutward;
  const dirX = cuffIsHigh ? highX - lowX : lowX - highX;
  const dirY = cuffIsHigh ? highY - lowY : lowY - highY;
  const dirZ = cuffIsHigh ? highZ - lowZ : lowZ - highZ;
  const length = Math.hypot(dirX, dirY, dirZ);
  if (length < 1e-6) return fallback;

  const dir = { x: dirX / length, y: dirY / length, z: dirZ / length };
  return {
    origin: { x: (lowX + highX) * 0.5, y: (lowY + highY) * 0.5, z: (lowZ + highZ) * 0.5 },
    extent: fitSleeveExtentToAxis(dir, length * 0.5),
    dir,
  };
};

const resolveGarmentGradientWorldFrame = (scene: Object3D): garmentGradientWorldFrameType => {
  worldBox.makeEmpty();
  scene.traverse((object) => {
    if (isGarmentMesh(object)) worldBox.expandByObject(object);
  });

  return frameFromBox(worldBox);
};

const resolveGarmentPartGradientFrame = (
  root: Object3D,
  part: garmentGradientPartRefType,
  garmentFrame: garmentGradientWorldFrameType,
): garmentGradientWorldFrameType => {
  if (!isSleeveGarmentPart(part)) return garmentFrame;

  partBox.makeEmpty();
  expandBoxByMeshNames(root, part.meshNames, partBox);
  if (partBox.isEmpty()) return garmentFrame;

  partBox.getCenter(partCenter);
  partBox.getSize(partSize);
  const aabbExtent = { x: Math.max(partSize.x * 0.5, 1e-5), y: Math.max(partSize.y * 0.5, 1e-5), z: Math.max(partSize.z * 0.5, 1e-5) };
  const sleeveFrame = resolveSleeveGradientDir(root, part.meshNames, partCenter, garmentFrame.origin);
  if ('extent' in sleeveFrame) {
    return sleeveFrame;
  }

  return {
    origin: { x: partCenter.x, y: partCenter.y, z: partCenter.z },
    extent: aabbExtent,
    dir: sleeveFrame,
  };
};

const resolveGarmentGradientDir = (frame: garmentGradientWorldFrameType | undefined, rotationRad: number) => {
  if (frame?.dir) {
    return frame.dir;
  }

  return {
    x: Math.sin(rotationRad),
    y: -Math.cos(rotationRad),
    z: 0,
  };
};

const evaluateGarmentGradientUvT = (
  uv: { u: number; v: number },
  axis: { x: number; y: number },
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
) => {
  const partU = (uv.u - bounds.minX) / Math.max(bounds.maxX - bounds.minX, 1e-5);
  const partV = (uv.v - bounds.minY) / Math.max(bounds.maxY - bounds.minY, 1e-5);
  const t = Math.max(axis.x, 0) * partU + Math.max(-axis.x, 0) * (1 - partU) + Math.max(axis.y, 0) * partV + Math.max(-axis.y, 0) * (1 - partV);
  return Math.min(1, Math.max(0, t));
};

const evaluateGarmentGradientWorldT = (world: { x: number; y: number; z: number }, frame: garmentGradientWorldFrameType, rotationRad: number) => {
  const dir = resolveGarmentGradientDir(frame, rotationRad);
  const localX = world.x - frame.origin.x;
  const localY = world.y - frame.origin.y;
  const localZ = world.z - frame.origin.z;
  const span = Math.abs(dir.x) * frame.extent.x + Math.abs(dir.y) * frame.extent.y + Math.abs(dir.z) * frame.extent.z;
  const t = ((localX * dir.x + localY * dir.y + localZ * dir.z) / Math.max(span, 1e-5)) * 0.5 + 0.5;
  return Math.min(1, Math.max(0, t));
};

const evaluateGarmentGradientMask = (t: number, position: number, softness: number, opacity: number) => {
  const spread = softness * 0.5;
  const stop0 = Math.max(0, position - spread);
  const stop1 = Math.min(1, Math.max(position + spread, stop0 + 0.001));
  const clamped = Math.min(1, Math.max(0, (t - stop0) / (stop1 - stop0)));
  return clamped * clamped * (3 - 2 * clamped) * opacity;
};

export type { garmentGradientPartRefType, garmentGradientWorldFrameType };
export {
  evaluateGarmentGradientMask,
  evaluateGarmentGradientUvT,
  evaluateGarmentGradientWorldT,
  isSleeveGarmentPart,
  resolveGarmentGradientDir,
  resolveGarmentGradientWorldFrame,
  resolveGarmentPartGradientFrame,
};
