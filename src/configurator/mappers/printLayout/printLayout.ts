import { FULL_UV_BOUNDS } from '@configurator/constants';
import type { garmentPartConfigType, uvBoundsType, uvPointType } from '@types';

const resolvePartUvBounds = (part: garmentPartConfigType): uvBoundsType => part.uvBounds ?? FULL_UV_BOUNDS;

/** Print placement UV in JSON is 0..1 inside the part; runtime expects atlas coordinates. */
const resolvePrintLocalUvToAtlas = (part: garmentPartConfigType, localUv: uvPointType): uvPointType => {
  const bounds = resolvePartUvBounds(part);

  return {
    x: bounds.minX + localUv.x * (bounds.maxX - bounds.minX),
    y: bounds.minY + localUv.y * (bounds.maxY - bounds.minY),
  };
};

export { resolvePartUvBounds, resolvePrintLocalUvToAtlas };
