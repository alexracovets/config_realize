import type { drawNameStrokeMaskGeometryInputType } from '@configurator/types';
import { FONT_FAMILY_BY_NAME, NAME_REFERENCE_FONT_SIZE } from '@configurator/constants';
import { applyTextCanvasDrawOptions } from '@configurator/utils';
const resolveFontFamily = (fontName: string) => FONT_FAMILY_BY_NAME[fontName] ?? fontName;

const resolveReferenceStrokeWidth = (strokeWidth: number, fontSize: number) => strokeWidth * (NAME_REFERENCE_FONT_SIZE / Math.max(fontSize, 1));

const drawNameStrokeMaskGeometry = (
  ctx: CanvasRenderingContext2D,
  instance: drawNameStrokeMaskGeometryInputType,
  canvasWidth: number,
  canvasHeight: number,
) => {
  if (!instance.text.trim() || instance.strokeWidth <= 0) return;

  const fontFamily = resolveFontFamily(instance.font);
  const lineWidth = resolveReferenceStrokeWidth(instance.strokeWidth, instance.fontSize);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.font = `${NAME_REFERENCE_FONT_SIZE}px ${fontFamily}`;
  applyTextCanvasDrawOptions(ctx, { letterSpacing: instance.letterSpacing });
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = '#ffffff';

  // Match the fill draw: center the ink box so stroke + fill + frame stay aligned.
  const metrics = ctx.measureText(instance.text);
  const ascent = metrics.actualBoundingBoxAscent ?? NAME_REFERENCE_FONT_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent ?? NAME_REFERENCE_FONT_SIZE * 0.2;
  const inkCenterOffset = (ascent - descent) / 2;

  ctx.strokeText(instance.text, 0, inkCenterOffset);
  ctx.restore();
};

export { drawNameStrokeMaskGeometry, resolveReferenceStrokeWidth };
