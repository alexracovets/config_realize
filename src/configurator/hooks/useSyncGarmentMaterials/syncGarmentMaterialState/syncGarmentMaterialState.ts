import type { MeshStandardMaterial } from 'three';

import type { garmentPrintStateType, patternColorPairType } from '@configurator/types';
import type { garmentConfigType, partGradientType } from '@types';
import { DISABLED_PART_GRADIENT, resolveGradientColors, resolvePartUvBounds } from '@configurator/mappers';
import { DEFAULT_COLOR } from '@store';
import { applyGarmentGradient, applyGarmentPartUvBounds, applyGarmentPatternTints, applyGarmentPrint, isColorOnlyGarmentPart } from '@configurator/utils';

type syncGarmentMaterialContextType = {
  product: garmentConfigType;
  byPart: Record<string, string>;
  gradientsByPart: Record<string, partGradientType>;
  getMaterials: (partId: string) => readonly MeshStandardMaterial[];
  invalidate: () => void;
};

const applyPartColors = ({ product, byPart, gradientsByPart, getMaterials, invalidate }: syncGarmentMaterialContextType) => {
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
    }
  }

  invalidate();
};

const applyPatternTints = ({ product, getMaterials, invalidate }: syncGarmentMaterialContextType, colors: patternColorPairType, activeOpacity: number) => {
  for (const part of product.parts) {
    if (isColorOnlyGarmentPart(part)) continue;

    for (const material of getMaterials(part.id)) {
      applyGarmentPatternTints(material, colors, activeOpacity);
    }
  }

  invalidate();
};

const applyPrintState = (
  { product, getMaterials, invalidate }: syncGarmentMaterialContextType,
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
export type { syncGarmentMaterialContextType };
