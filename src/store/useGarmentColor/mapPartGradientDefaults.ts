'use client';

import type { garmentConfigType, garmentPartConfigType, partGradientConfigType, partGradientType } from '@types';

import { DEFAULT_GRADIENT_COLOR2, DISABLED_PART_GRADIENT } from './partGradientTypes';

const FALLBACK_GRADIENT_CONFIG: partGradientConfigType = {
  reversed: false,
  rotation: 0,
  position: 0.5,
  softness: 0.5,
  opacity: 1,
};

const mapPartGradientDefaults = (part: garmentPartConfigType): partGradientType => {
  if (part.colorOnly) {
    return { ...DISABLED_PART_GRADIENT };
  }

  const config = part.gradient ?? FALLBACK_GRADIENT_CONFIG;

  return {
    enabled: false,
    reversed: config.reversed,
    color2: DEFAULT_GRADIENT_COLOR2,
    rotation: config.rotation,
    position: config.position,
    softness: config.softness,
    opacity: config.opacity,
  };
};

const buildDefaultGradients = (product: garmentConfigType): Record<string, partGradientType> =>
  Object.fromEntries(product.parts.map((part) => [part.id, mapPartGradientDefaults(part)]));

const resolveGradientColors = (baseColor: string, gradient: partGradientType) => {
  if (!gradient.enabled || !gradient.reversed) {
    return { fabricColor: baseColor, gradientColor2: gradient.color2 };
  }

  return { fabricColor: gradient.color2, gradientColor2: baseColor };
};

export { buildDefaultGradients, mapPartGradientDefaults, resolveGradientColors };
