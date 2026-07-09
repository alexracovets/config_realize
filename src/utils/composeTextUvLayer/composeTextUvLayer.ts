'use client';

import type { orderCuttingExportTextLayerSpecType } from '@types';
import { FONT_FAMILY_BY_NAME } from '@configurator/constants';

const resolveFontFamily = (fontName: string): string => FONT_FAMILY_BY_NAME[fontName] ?? fontName;

const loadLayerFonts = async (layers: orderCuttingExportTextLayerSpecType[]) => {
  if (typeof document === 'undefined' || !('fonts' in document)) return;

  await Promise.all(
    layers.map((layer) => document.fonts.load(`${Math.max(1, Math.round(layer.fontSize))}px ${resolveFontFamily(layer.font)}`, layer.text)),
  ).catch(() => undefined);
};

const drawTextLayer = (ctx: CanvasRenderingContext2D, layer: orderCuttingExportTextLayerSpecType, atlasWidth: number, atlasHeight: number) => {
  const text = layer.text.trim();
  if (!text) return;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(layer.uv.x * atlasWidth, layer.uv.y * atlasHeight);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.font = `${layer.fontSize}px ${resolveFontFamily(layer.font)}`;
  if (typeof layer.letterSpacing === 'number' && 'letterSpacing' in ctx) {
    ctx.letterSpacing = `${layer.letterSpacing}px`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineStep = layer.fontSize * (layer.lineHeight ?? 1);
  const firstLineOffset = -((lines.length - 1) * lineStep) / 2;

  lines.forEach((line, index) => {
    const y = firstLineOffset + index * lineStep;

    if (layer.strokeWidth > 0) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth * 2;
      ctx.strokeText(line, 0, y);
    }

    ctx.fillStyle = layer.textColor;
    ctx.fillText(line, 0, y);
  });

  ctx.restore();
};

/**
 * Renders configured text prints onto a transparent print-atlas-sized PNG.
 * Placement mirrors the garment shader anchors (atlas UV + total print rotation).
 */
const composeTextUvLayer = async (atlasWidth: number, atlasHeight: number, layers: orderCuttingExportTextLayerSpecType[]): Promise<string> => {
  await loadLayerFonts(layers);

  const canvas = document.createElement('canvas');
  canvas.width = atlasWidth;
  canvas.height = atlasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available.');

  layers.forEach((layer) => drawTextLayer(ctx, layer, atlasWidth, atlasHeight));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export text UV layer.'));
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      'image/png',
      1,
    );
  });
};

export { composeTextUvLayer };
