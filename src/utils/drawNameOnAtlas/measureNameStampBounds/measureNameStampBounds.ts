import { FONT_FAMILY_BY_NAME, NAME_REFERENCE_FONT_SIZE, NAME_STAMP_FONT_SIZE_MIN, NAME_STAMP_STROKE_WIDTH_MAX } from '@constants';
import type { stampPixelSizeType, textCanvasDrawOptionsType } from '@types';

import { applyTextCanvasDrawOptions } from '../applyTextCanvasDrawOptions';

const resolveMaxReferenceStrokeWidth = () => NAME_STAMP_STROKE_WIDTH_MAX * (NAME_REFERENCE_FONT_SIZE / NAME_STAMP_FONT_SIZE_MIN);

const STAMP_BOUNDS_PADDING = 20;

const resolveFontFamily = (fontName: string) => FONT_FAMILY_BY_NAME[fontName] ?? fontName;

const measureNameStampPixelSize = (
  text: string,
  font: string,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType,
): stampPixelSizeType | null => {
  if (!text.trim()) return null;

  const fontFamily = resolveFontFamily(font);
  measureCtx.font = `${NAME_REFERENCE_FONT_SIZE}px ${fontFamily}`;
  applyTextCanvasDrawOptions(measureCtx, options);

  const metrics = measureCtx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent ?? NAME_REFERENCE_FONT_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent ?? NAME_REFERENCE_FONT_SIZE * 0.2;
  const strokePad = Math.ceil(resolveMaxReferenceStrokeWidth() / 2);
  const pad = STAMP_BOUNDS_PADDING + strokePad;

  return {
    width: Math.max(1, Math.ceil(metrics.width + pad * 2)),
    height: Math.max(1, Math.ceil(ascent + descent + pad * 2)),
  };
};

// Half-size (in reference-font px) of the selection frame for one name: the raw glyph box plus a small gap.
const GIZMO_FRAME_PADDING = 30;

const measureNameGizmoHalf = (
  text: string,
  font: string,
  measureCtx: CanvasRenderingContext2D,
  options?: textCanvasDrawOptionsType & { lineHeight?: number },
): { x: number; y: number } | null => {
  if (!text.trim()) return null;

  const fontFamily = resolveFontFamily(font);
  measureCtx.font = `${NAME_REFERENCE_FONT_SIZE}px ${fontFamily}`;
  applyTextCanvasDrawOptions(measureCtx, options);

  const metrics = measureCtx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent ?? NAME_REFERENCE_FONT_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent ?? NAME_REFERENCE_FONT_SIZE * 0.2;
  const lineHeight = options?.lineHeight ?? 1;

  return {
    x: metrics.width / 2 + GIZMO_FRAME_PADDING,
    y: ((ascent + descent) / 2 + GIZMO_FRAME_PADDING) * lineHeight,
  };
};

const unionStampPixelSize = (sizes: stampPixelSizeType[]): stampPixelSizeType => {
  if (sizes.length === 0) {
    return { width: 1, height: 1 };
  }

  return {
    width: Math.max(...sizes.map((size) => size.width)),
    height: Math.max(...sizes.map((size) => size.height)),
  };
};

export { measureNameGizmoHalf, measureNameStampPixelSize, unionStampPixelSize };
