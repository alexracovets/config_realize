import { FULL_UV_BOUNDS } from '@configurator/constants';
import type { garmentPartConfigType, uvBoundsType, uvPointType } from '@types';

const resolvePartUvBounds = (part: garmentPartConfigType): uvBoundsType => part.uvBounds ?? FULL_UV_BOUNDS;

const resolvePartCenterUv = (part: garmentPartConfigType): uvPointType => {
  const bounds = resolvePartUvBounds(part);
  return {
    x: (bounds.minX + bounds.maxX) * 0.5,
    y: (bounds.minY + bounds.maxY) * 0.5,
  };
};

const resolvePrintLocalUvToAtlas = (part: garmentPartConfigType, localUv: uvPointType): uvPointType => {
  const bounds = resolvePartUvBounds(part);

  return {
    x: bounds.minX + localUv.x * (bounds.maxX - bounds.minX),
    y: bounds.minY + localUv.y * (bounds.maxY - bounds.minY),
  };
};

export { resolvePartCenterUv, resolvePartUvBounds, resolvePrintLocalUvToAtlas };
