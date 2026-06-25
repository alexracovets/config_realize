import type { MeshStandardMaterial } from 'three';

import type { garmentConfigType, garmentPrintStateType, partGradientType, patternColorPairType } from '@types';
import { DEFAULT_COLOR, DISABLED_PART_GRADIENT, resolveGradientColors } from '@store';
import {
  applyGarmentGradient,
  applyGarmentPartUvBounds,
  applyGarmentPatternTints,
  applyGarmentPrint,
  isColorOnlyGarmentPart,
  resolvePartUvBounds,
} from '@utils';

type applyGarmentAppearanceContextType = {
  product: garmentConfigType;
  byPart: Record<string, string>;
  gradientsByPart: Record<string, partGradientType>;
  getMaterials: (partId: string) => readonly MeshStandardMaterial[];
  invalidate: () => void;
};

const applyPartColors = ({ product, byPart, gradientsByPart, getMaterials, invalidate }: applyGarmentAppearanceContextType) => {
  for (const part of product.parts) {
    const color = byPart[part.id] ?? DEFAULT_COLOR;
    const gradient = isColorOnlyGarmentPart(part) ? DISABLED_PART_GRADIENT : (gradientsByPart[part.id] ?? DISABLED_PART_GRADIENT);
    const { fabricColor, gradientColor2 } = resolveGradientColors(color, gradient);
    const uvBounds = resolvePartUvBounds(part);

    for (const material of getMaterials(part.id)) {
      material.color.set(fabricColor);
      material.map = null;
      applyGarmentPartUvBounds(material, uvBounds);
      applyGarmentGradient(material, { ...gradient, color2: gradientColor2 });
      material.needsUpdate = true;
    }
  }

  invalidate();
};

const applyPatternTints = (
  { product, getMaterials, invalidate }: applyGarmentAppearanceContextType,
  colors: patternColorPairType,
  activeOpacity: number,
) => {
  for (const part of product.parts) {
    if (isColorOnlyGarmentPart(part)) continue;

    for (const material of getMaterials(part.id)) {
      applyGarmentPatternTints(material, colors, activeOpacity);
    }
  }

  invalidate();
};

const applyPrintState = (
  { product, getMaterials, invalidate }: applyGarmentAppearanceContextType,
  state: garmentPrintStateType,
  emptyState: garmentPrintStateType,
) => {
  for (const part of product.parts) {
    const partState = isColorOnlyGarmentPart(part) ? emptyState : state;

    for (const material of getMaterials(part.id)) {
      applyGarmentPrint(material, partState);
    }
  }

  invalidate();
};

export { applyPartColors, applyPatternTints, applyPrintState };
export type { applyGarmentAppearanceContextType };
