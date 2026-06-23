import { FONT_FAMILY_BY_NAME, NAME_REFERENCE_FONT_SIZE } from '@constants';
import type { drawNameMaskGeometryInputType } from '@types';

import { applyTextCanvasDrawOptions } from '../applyTextCanvasDrawOptions';

const resolveFontFamily = (fontName: string) => FONT_FAMILY_BY_NAME[fontName] ?? fontName;

const drawNameMaskGeometry = (ctx: CanvasRenderingContext2D, instance: drawNameMaskGeometryInputType, canvasWidth: number, canvasHeight: number) => {
  if (!instance.text.trim()) return;

  const fontFamily = resolveFontFamily(instance.font);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.font = `${NAME_REFERENCE_FONT_SIZE}px ${fontFamily}`;
  applyTextCanvasDrawOptions(ctx, { letterSpacing: instance.letterSpacing });
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';

  // Center the actual glyph ink box (not the em box) so the text lines up with the symmetric gizmo frame.
  const metrics = ctx.measureText(instance.text);
  const ascent = metrics.actualBoundingBoxAscent ?? NAME_REFERENCE_FONT_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent ?? NAME_REFERENCE_FONT_SIZE * 0.2;
  const inkCenterOffset = (ascent - descent) / 2;

  ctx.fillText(instance.text, 0, inkCenterOffset);
  ctx.restore();
};

export { drawNameMaskGeometry };
