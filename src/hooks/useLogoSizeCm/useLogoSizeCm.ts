'use client';

import { LOGO_SCALE_MAX, LOGO_SCALE_MIN } from '@configurator/constants';
import { resolveLogoDrawSize, resolvePrintAtlasSize } from '@configurator/utils';
import { usePrintUnits } from '@hooks';
import { useConfiguratorProduct } from '@store';
import type { logoInstanceType } from '@types';
import { useMemo } from 'react';

interface logoSizeCmType {
  heightCm: number;
  widthCm: number;
  heightMinCm: number;
  heightMaxCm: number;
  widthMinCm: number;
  widthMaxCm: number;
  step: number;
  scaleFromHeightCm: (heightCm: number) => number;
  scaleFromWidthCm: (widthCm: number) => number;
}

const useLogoSizeCm = (instance: Pick<logoInstanceType, 'scale' | 'naturalWidth' | 'naturalHeight'>): logoSizeCmType => {
  const product = useConfiguratorProduct((state) => state.product);
  const { x: unitX, y: unitY } = usePrintUnits();

  return useMemo(() => {
    const atlasWidth = resolvePrintAtlasSize(product).width;
    const naturalWidth = instance.naturalWidth || 1;
    const naturalHeight = instance.naturalHeight || 1;

    const sizeAtScale = (scale: number) => resolveLogoDrawSize({ ...instance, scale }, naturalWidth, naturalHeight, atlasWidth);

    const current = sizeAtScale(instance.scale);
    const atMin = sizeAtScale(LOGO_SCALE_MIN);
    const atMax = sizeAtScale(LOGO_SCALE_MAX);

    return {
      heightCm: unitY.toUnit(current.height),
      widthCm: unitX.toUnit(current.width),
      heightMinCm: unitY.toUnit(atMin.height),
      heightMaxCm: unitY.toUnit(atMax.height),
      widthMinCm: unitX.toUnit(atMin.width),
      widthMaxCm: unitX.toUnit(atMax.width),
      step: unitY.step,
      scaleFromHeightCm: (heightCm) => {
        const targetHeightPx = unitY.toPx(heightCm);
        const referenceHeight = sizeAtScale(1).height;
        return referenceHeight > 0 ? targetHeightPx / referenceHeight : instance.scale;
      },
      scaleFromWidthCm: (widthCm) => {
        const targetWidthPx = unitX.toPx(widthCm);
        const referenceWidth = sizeAtScale(1).width;
        return referenceWidth > 0 ? targetWidthPx / referenceWidth : instance.scale;
      },
    };
  }, [instance, product, unitX, unitY]);
};

export { useLogoSizeCm };
export type { logoSizeCmType };
