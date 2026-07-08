'use client';

import type { orderCuttingExportColorPartSpecType } from '@types';
import type { BufferAttribute, Mesh, Object3D } from 'three';
import { GLTFLoader } from 'three-stdlib';

type rgbColorType = { r: number; g: number; b: number };

type pixelColorResolverType = (x: number, y: number) => rgbColorType;

type garmentColorAtlasPartType = orderCuttingExportColorPartSpecType & {
  meshNames: string[];
};

const gltfLoader = new GLTFLoader();
const gltfCache = new Map<string, Promise<Awaited<ReturnType<typeof gltfLoader.loadAsync>>>>();

const hexToRgb = (hex: string): rgbColorType => {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;

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

const isPointInsideTriangle = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): boolean => {
  const denominator = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (Math.abs(denominator) < 1e-8) return false;

  const alpha = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / denominator;
  const beta = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / denominator;
  const gamma = 1 - alpha - beta;

  return alpha >= 0 && beta >= 0 && gamma >= 0;
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
  resolveColor: pixelColorResolverType,
) => {
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(ay, by, cy)));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (!isPointInsideTriangle(x + 0.5, y + 0.5, ax, ay, bx, by, cx, cy)) continue;

      const color = resolveColor(x + 0.5, y + 0.5);
      const index = (y * width + x) * 4;
      pixels[index] = color.r;
      pixels[index + 1] = color.g;
      pixels[index + 2] = color.b;
      pixels[index + 3] = 255;
    }
  }
};

const rasterizeMeshUv = (mesh: Mesh, pixels: Uint8ClampedArray, width: number, height: number, resolveColor: pixelColorResolverType) => {
  const uvAttribute = mesh.geometry.getAttribute('uv') as BufferAttribute | undefined;
  if (!uvAttribute) return;

  const indexAttribute = mesh.geometry.getIndex();

  const drawFace = (ia: number, ib: number, ic: number) => {
    const a = uvToPixel(uvAttribute.getX(ia), uvAttribute.getY(ia), width, height);
    const b = uvToPixel(uvAttribute.getX(ib), uvAttribute.getY(ib), width, height);
    const c = uvToPixel(uvAttribute.getX(ic), uvAttribute.getY(ic), width, height);
    rasterizeTriangle(pixels, width, height, a.x, a.y, b.x, b.y, c.x, c.y, resolveColor);
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

/** CPU port of `garmentGradientMask` from the garment fragment shader. */
const buildGradientColorResolver = (part: garmentColorAtlasPartType, atlasWidth: number, atlasHeight: number): pixelColorResolverType => {
  const baseColor = hexToRgb(part.color);
  const gradient = part.gradient;
  if (!gradient) return () => baseColor;

  const color2 = hexToRgb(gradient.color2);
  const rotationRad = (gradient.rotation * Math.PI) / 180;
  const dirX = Math.cos(rotationRad);
  const dirY = Math.sin(rotationRad);
  const startX = 0.5 - dirX * 0.5;
  const startY = 0.5 - dirY * 0.5;
  const lengthSq = dirX * dirX + dirY * dirY;
  const mid = gradient.position;
  const spread = gradient.softness * 0.5;
  const stop0 = Math.max(0, mid - spread);
  const stop1 = Math.min(1, Math.max(mid + spread, stop0 + 0.001));
  const { minX, minY, maxX, maxY } = gradient.uvBounds;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  return (x, y) => {
    const partU = (x / atlasWidth - minX) / spanX;
    const partV = (y / atlasHeight - minY) / spanY;
    let t = ((partU - startX) * dirX + (partV - startY) * dirY) / lengthSq;
    t = Math.min(1, Math.max(0, t));

    const smoothT = Math.min(1, Math.max(0, (t - stop0) / (stop1 - stop0)));
    const mask = smoothT * smoothT * (3 - 2 * smoothT) * gradient.opacity;

    return mixRgb(baseColor, color2, mask);
  };
};

const composeGarmentColorUvAtlas = async (
  modelSrc: string,
  atlasWidth: number,
  atlasHeight: number,
  parts: garmentColorAtlasPartType[],
): Promise<string> => {
  const gltf = await loadGarmentGltf(modelSrc);
  const pixels = new Uint8ClampedArray(atlasWidth * atlasHeight * 4);

  parts.forEach((part) => {
    const resolveColor = buildGradientColorResolver(part, atlasWidth, atlasHeight);

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
