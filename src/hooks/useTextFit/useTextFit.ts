'use client';

import {
  measureTextWidthAtFontSize,
  resolveTextFitFromHeight,
  resolveTextFitFromWidth,
  type textFitLimitsType,
  type textFitSizeType,
} from '@configurator/utils';
import { useMemo } from 'react';

interface textFitMeasureOptionsType {
  letterSpacing?: number;
  lineHeight?: number;
}

interface textFitApiType {
  measureWidth: (text: string, font: string, fontSize: number, options?: textFitMeasureOptionsType) => number;
  fitFromHeight: (text: string, font: string, requestedFontSize: number, limits: textFitLimitsType, options?: textFitMeasureOptionsType) => textFitSizeType;
  fitFromWidth: (text: string, font: string, requestedWidth: number, limits: textFitLimitsType, options?: textFitMeasureOptionsType) => textFitSizeType;
}

const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measureCtx = measureCanvas?.getContext('2d') ?? null;

const useTextFit = (): textFitApiType =>
  useMemo(
    () => ({
      measureWidth: (text, font, fontSize, options) => (measureCtx ? measureTextWidthAtFontSize(text, font, fontSize, measureCtx, options) : 0),
      fitFromHeight: (text, font, requestedFontSize, limits, options) =>
        measureCtx ? resolveTextFitFromHeight(text, font, requestedFontSize, limits, measureCtx, options) : { fontSize: requestedFontSize, width: 0 },
      fitFromWidth: (text, font, requestedWidth, limits, options) =>
        measureCtx ? resolveTextFitFromWidth(text, font, requestedWidth, limits, measureCtx, options) : { fontSize: limits.heightMin, width: requestedWidth },
    }),
    [],
  );

export { useTextFit };
export type { textFitApiType, textFitMeasureOptionsType };
