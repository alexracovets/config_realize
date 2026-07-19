import type { textCanvasDrawOptionsType } from '@configurator/types';
import { NAME_REFERENCE_FONT_SIZE } from '@configurator/constants';
import { measureNameGizmoHalf } from '@configurator/utils';

interface textFitLimitsType {
  widthMin: number;
  widthMax: number;
  heightMin: number;
  heightMax: number;
}

interface textFitSizeType {
  fontSize: number;
  width: number;
}

const measureReferenceHalf = (
  text: string,
  font: string,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType & { lineHeight?: number },
) => measureNameGizmoHalf(text, font, measureCtx, options);

const measureTextWidthAtFontSize = (
  text: string,
  font: string,
  fontSize: number,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType & { lineHeight?: number },
): number => {
  const referenceHalf = measureReferenceHalf(text, font, measureCtx, options);
  if (!referenceHalf) return 0;

  return 2 * referenceHalf.x * (fontSize / NAME_REFERENCE_FONT_SIZE);
};

const resolveFontSizeForWidth = (
  text: string,
  font: string,
  targetWidth: number,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType & { lineHeight?: number },
): number => {
  const referenceHalf = measureReferenceHalf(text, font, measureCtx, options);
  const referenceWidth = referenceHalf ? 2 * referenceHalf.x : 0;
  if (referenceWidth <= 0) return NAME_REFERENCE_FONT_SIZE;

  return (targetWidth / referenceWidth) * NAME_REFERENCE_FONT_SIZE;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const resolveTextFitFromHeight = (
  text: string,
  font: string,
  requestedFontSize: number,
  limits: textFitLimitsType,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType & { lineHeight?: number },
): textFitSizeType => {
  const fontSize = clamp(requestedFontSize, limits.heightMin, limits.heightMax);
  const width = measureTextWidthAtFontSize(text, font, fontSize, measureCtx, options);

  if (width <= limits.widthMax) return { fontSize, width };

  const fittedFontSize = clamp(resolveFontSizeForWidth(text, font, limits.widthMax, measureCtx, options), limits.heightMin, limits.heightMax);
  return { fontSize: fittedFontSize, width: measureTextWidthAtFontSize(text, font, fittedFontSize, measureCtx, options) };
};

const resolveTextFitFromWidth = (
  text: string,
  font: string,
  requestedWidth: number,
  limits: textFitLimitsType,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType & { lineHeight?: number },
): textFitSizeType => {
  const width = clamp(requestedWidth, limits.widthMin, limits.widthMax);
  const fontSize = clamp(resolveFontSizeForWidth(text, font, width, measureCtx, options), limits.heightMin, limits.heightMax);
  return { fontSize, width: measureTextWidthAtFontSize(text, font, fontSize, measureCtx, options) };
};

export { measureTextWidthAtFontSize, resolveFontSizeForWidth, resolveTextFitFromHeight, resolveTextFitFromWidth };
export type { textFitLimitsType, textFitSizeType };
