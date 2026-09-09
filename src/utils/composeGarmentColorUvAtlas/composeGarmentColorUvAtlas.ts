'use client';

import type { orderCuttingExportColorPartSpecType } from '@types';
import type { BufferAttribute, Mesh, Object3D } from 'three';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import {
  evaluateGarmentGradientMask,
  evaluateGarmentGradientUvT,
  evaluateGarmentGradientWorldT,
  type garmentGradientWorldFrameType,
  resolveGarmentPartGradientFrame,
} from '@configurator/utils';

type rgbColorType = { r: number; g: number; b: number };
type worldPointType = { x: number; y: number; z: number };
type pixelColorResolverType = (world: worldPointType, uv: { u: number; v: number }) => rgbColorType;

type garmentColorAtlasPartType = orderCuttingExportColorPartSpecType & {
  meshNames: string[];
};

const gltfLoader = new GLTFLoader();
const gltfCache = new Map<string, Promise<Awaited<ReturnType<typeof gltfLoader.loadAsync>>>>();

const hexToRgb = (hex: string): rgbColorType => {
  const normalized = hex.replace('#', '').trim();
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const loadGarmentGltf = (modelSrc: string) => {
  const cached = gltfCache.get(modelSrc);
  if (cached) return cached;

  const promise = gltfLoader.loadAsync(modelSrc);
  gltfCache.set(modelSrc, promise);
  promise.catch(() => gltfCache.delete(modelSrc));

  return promise;
};

const findMeshByName = (root: Object3D, meshName: string): Mesh | null => {
  let match: Mesh | null = null;

  root.traverse((object) => {
    if (match || object.name !== meshName || !('isMesh' in object) || !(object as Mesh).isMesh) return;
    match = object as Mesh;
  });

  return match;
};

const triangleBarycentric = (px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
  const denominator = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (Math.abs(denominator) < 1e-8) return null;

  const alpha = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / denominator;
  const beta = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / denominator;
  const gamma = 1 - alpha - beta;

  if (alpha < 0 || beta < 0 || gamma < 0) return null;
  return { alpha, beta, gamma };
};

const uvToPixel = (u: number, v: number, width: number, height: number) => ({
  x: u * width,
  y: v * height,
});

const rasterizeTriangle = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  worldA: worldPointType,
  worldB: worldPointType,
  worldC: worldPointType,
  resolveColor: pixelColorResolverType,
) => {
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(ay, by, cy)));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const barycentric = triangleBarycentric(x + 0.5, y + 0.5, ax, ay, bx, by, cx, cy);
      if (!barycentric) continue;

      const color = resolveColor(
        {
          x: worldA.x * barycentric.alpha + worldB.x * barycentric.beta + worldC.x * barycentric.gamma,
          y: worldA.y * barycentric.alpha + worldB.y * barycentric.beta + worldC.y * barycentric.gamma,
          z: worldA.z * barycentric.alpha + worldB.z * barycentric.beta + worldC.z * barycentric.gamma,
        },
        { u: (x + 0.5) / width, v: (y + 0.5) / height },
      );
      const index = (y * width + x) * 4;
      pixels[index] = color.r;
      pixels[index + 1] = color.g;
      pixels[index + 2] = color.b;
      pixels[index + 3] = 255;
    }
  }
};

const worldPointFromVertex = (mesh: Mesh, vertexIndex: number, target: Vector3): worldPointType => {
  const position = mesh.geometry.getAttribute('position') as BufferAttribute;
  target.fromBufferAttribute(position, vertexIndex);
  mesh.localToWorld(target);
  return { x: target.x, y: target.y, z: target.z };
};

const rasterizeMeshUv = (mesh: Mesh, pixels: Uint8ClampedArray, width: number, height: number, resolveColor: pixelColorResolverType) => {
  const uvAttribute = mesh.geometry.getAttribute('uv') as BufferAttribute | undefined;
  if (!uvAttribute) return;

  const indexAttribute = mesh.geometry.getIndex();
  const worldA = new Vector3();
  const worldB = new Vector3();
  const worldC = new Vector3();

  const drawFace = (ia: number, ib: number, ic: number) => {
    const a = uvToPixel(uvAttribute.getX(ia), uvAttribute.getY(ia), width, height);
    const b = uvToPixel(uvAttribute.getX(ib), uvAttribute.getY(ib), width, height);
    const c = uvToPixel(uvAttribute.getX(ic), uvAttribute.getY(ic), width, height);
    rasterizeTriangle(
      pixels,
      width,
      height,
      a.x,
      a.y,
      b.x,
      b.y,
      c.x,
      c.y,
      worldPointFromVertex(mesh, ia, worldA),
      worldPointFromVertex(mesh, ib, worldB),
      worldPointFromVertex(mesh, ic, worldC),
      resolveColor,
    );
  };

  if (indexAttribute) {
    for (let faceIndex = 0; faceIndex < indexAttribute.count; faceIndex += 3) {
      drawFace(indexAttribute.getX(faceIndex), indexAttribute.getX(faceIndex + 1), indexAttribute.getX(faceIndex + 2));
    }
    return;
  }

  for (let vertexIndex = 0; vertexIndex < uvAttribute.count; vertexIndex += 3) {
    drawFace(vertexIndex, vertexIndex + 1, vertexIndex + 2);
  }
};

const pixelsToBlobUrl = (pixels: Uint8ClampedArray, width: number, height: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Canvas 2D context is not available.'));
      return;
    }

    context.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export garment color UV atlas.'));
          return;
        }

        resolve(URL.createObjectURL(blob));
      },
      'image/png',
      1,
    );
  });

const mixRgb = (a: rgbColorType, b: rgbColorType, t: number): rgbColorType => ({
  r: a.r + (b.r - a.r) * t,
  g: a.g + (b.g - a.g) * t,
  b: a.b + (b.b - a.b) * t,
});

const buildGradientColorResolver = (part: garmentColorAtlasPartType, frame: garmentGradientWorldFrameType): pixelColorResolverType => {
  const baseColor = hexToRgb(part.color);
  const gradient = part.gradient;
  if (!gradient) return () => baseColor;

  const color2 = hexToRgb(gradient.color2);
  const rotationRad = (gradient.rotation * Math.PI) / 180;
  const mid = gradient.position;
  const softness = gradient.softness;
  const opacity = gradient.opacity;

  return (world, uv) => {
    const t =
      frame.uvAxis && part.gradient?.uvBounds
        ? evaluateGarmentGradientUvT(uv, frame.uvAxis, part.gradient.uvBounds)
        : evaluateGarmentGradientWorldT(world, frame, rotationRad);
    const mask = evaluateGarmentGradientMask(t, mid, softness, opacity);
    return mixRgb(baseColor, color2, mask);
  };
};

const resolveExportGradientFrame = (root: Object3D, parts: garmentColorAtlasPartType[]): garmentGradientWorldFrameType => {
  root.updateMatrixWorld(true);
  const box = new Box3();

  parts.forEach((part) => {
    part.meshNames.forEach((meshName) => {
      const mesh = findMeshByName(root, meshName);
      if (mesh) box.expandByObject(mesh);
    });
  });

  if (box.isEmpty()) {
    return { origin: { x: 0, y: 0, z: 0 }, extent: { x: 1, y: 1, z: 1 } };
  }

  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  return {
    origin: { x: center.x, y: center.y, z: center.z },
    extent: { x: Math.max(size.x * 0.5, 1e-5), y: Math.max(size.y * 0.5, 1e-5), z: Math.max(size.z * 0.5, 1e-5) },
  };
};

const composeGarmentColorUvAtlas = async (modelSrc: string, atlasWidth: number, atlasHeight: number, parts: garmentColorAtlasPartType[]): Promise<string> => {
  const gltf = await loadGarmentGltf(modelSrc);
  const pixels = new Uint8ClampedArray(atlasWidth * atlasHeight * 4);
  const garmentFrame = resolveExportGradientFrame(gltf.scene, parts);

  parts.forEach((part) => {
    const frame = resolveGarmentPartGradientFrame(gltf.scene, part, garmentFrame);
    const resolveColor = buildGradientColorResolver(part, frame);

    part.meshNames.forEach((meshName) => {
      const mesh = findMeshByName(gltf.scene, meshName);
      if (!mesh) return;
      rasterizeMeshUv(mesh, pixels, atlasWidth, atlasHeight, resolveColor);
    });
  });

  return pixelsToBlobUrl(pixels, atlasWidth, atlasHeight);
};

export { composeGarmentColorUvAtlas };
export type { garmentColorAtlasPartType };
