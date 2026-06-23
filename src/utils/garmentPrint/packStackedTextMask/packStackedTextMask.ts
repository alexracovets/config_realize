import { canvasToMaskTexture } from '../canvasToMaskTexture';
import type { Texture } from 'three';

const packStackedTextMaskCanvas = (fillCanvas: HTMLCanvasElement, strokeCanvas: HTMLCanvasElement, targetCanvas?: HTMLCanvasElement): HTMLCanvasElement => {
  const width = fillCanvas.width;
  const height = fillCanvas.height;
  const canvas = targetCanvas ?? document.createElement('canvas');

  canvas.width = width;
  canvas.height = height * 2;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fillCanvas, 0, 0, width, height, 0, 0, width, height);
  ctx.drawImage(strokeCanvas, 0, 0, width, height, 0, height, width, height);

  return canvas;
};

const packStackedTextMaskTexture = (
  fillCanvas: HTMLCanvasElement,
  strokeCanvas: HTMLCanvasElement,
  stackedCanvas?: HTMLCanvasElement | null,
  stackedTexture?: Texture | null,
): Texture => {
  const canvas = packStackedTextMaskCanvas(fillCanvas, strokeCanvas, stackedCanvas ?? undefined);

  if (stackedTexture) {
    stackedTexture.image = canvas;
    stackedTexture.needsUpdate = true;
    return stackedTexture;
  }

  return canvasToMaskTexture(canvas);
};

export { packStackedTextMaskCanvas, packStackedTextMaskTexture };
