import type { garmentConfigType, garmentPartConfigType, printAtlasConfigType, uvBoundsType, uvPointType } from '@types';

import { DEFAULT_PART_TEXTURE_SIZE, FULL_UV_BOUNDS, PRINT_ATLAS_HEIGHT, PRINT_ATLAS_WIDTH } from '@constants';

const DEFAULT_PRINT_ATLAS: printAtlasConfigType = {
  width: PRINT_ATLAS_WIDTH,
  height: PRINT_ATLAS_HEIGHT,
};

const resolvePrintAtlasSize = (product: garmentConfigType): printAtlasConfigType => product.printAtlas ?? DEFAULT_PRINT_ATLAS;

const resolvePartTextureSize = (product: garmentConfigType): number => product.partTextureSize ?? DEFAULT_PART_TEXTURE_SIZE;

const resolvePartUvBounds = (part: garmentPartConfigType): uvBoundsType => part.uvBounds ?? FULL_UV_BOUNDS;

const resolvePartPrintRotation = (part: garmentPartConfigType): number => part.printRotation ?? part.gradient?.rotation ?? 0;

const resolveProductGizmoRotation = (product: garmentConfigType): number => product.gizmoRotation ?? 0;

const resolveGizmoElementRotationDeg = (product: garmentConfigType, instanceRotationDeg: number): number =>
  resolveProductGizmoRotation(product) + instanceRotationDeg;

const isColorOnlyGarmentPart = (part: garmentPartConfigType): boolean => part.colorOnly === true;

const isUvInsidePartBounds = (uv: uvPointType, bounds: uvBoundsType = FULL_UV_BOUNDS): boolean =>
  uv.x >= bounds.minX && uv.x <= bounds.maxX && uv.y >= bounds.minY && uv.y <= bounds.maxY;

const clampUvToPartBounds = (uv: uvPointType, bounds: uvBoundsType = FULL_UV_BOUNDS): uvPointType => ({
  x: Math.min(bounds.maxX, Math.max(bounds.minX, uv.x)),
  y: Math.min(bounds.maxY, Math.max(bounds.minY, uv.y)),
});

/** Print placement UV in JSON is 0..1 inside the part; shaders expect atlas coordinates. */
const resolvePrintLocalUvToAtlas = (part: garmentPartConfigType, localUv: uvPointType): uvPointType => {
  const bounds = resolvePartUvBounds(part);

  return {
    x: bounds.minX + localUv.x * (bounds.maxX - bounds.minX),
    y: bounds.minY + localUv.y * (bounds.maxY - bounds.minY),
  };
};

const repairPrintInstancePlacement = <T extends { partId: string; uv: uvPointType }>(instance: T, parts: garmentPartConfigType[]): T => {
  const assignedPart = parts.find((part) => part.id === instance.partId);
  const assignedBounds = assignedPart ? resolvePartUvBounds(assignedPart) : FULL_UV_BOUNDS;

  if (isUvInsidePartBounds(instance.uv, assignedBounds)) {
    return instance;
  }

  const containingPart = parts.find((part) => isUvInsidePartBounds(instance.uv, resolvePartUvBounds(part)));
  if (containingPart) {
    return { ...instance, partId: containingPart.id };
  }

  return { ...instance, uv: clampUvToPartBounds(instance.uv, assignedBounds) };
};

export {
  clampUvToPartBounds,
  isColorOnlyGarmentPart,
  isUvInsidePartBounds,
  repairPrintInstancePlacement,
  resolveGizmoElementRotationDeg,
  resolvePartPrintRotation,
  resolvePartTextureSize,
  resolvePartUvBounds,
  resolvePrintAtlasSize,
  resolvePrintLocalUvToAtlas,
  resolveProductGizmoRotation,
};
