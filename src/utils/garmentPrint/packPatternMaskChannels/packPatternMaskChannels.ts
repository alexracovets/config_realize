import type { Texture } from 'three';

import { canvasToMaskTexture } from '../canvasToMaskTexture';
import { getEmptyPrintTexture } from '../emptyPrintTexture';

const readMaskAlpha = (data: Uint8ClampedArray, index: number) => {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];
  const rgbMax = Math.max(r, g, b);
  const isGrayscale = Math.abs(r - g) <= 2 && Math.abs(g - b) <= 2;

  if (isGrayscale) {
    // Brush softness encoded in gray RGB (Design 1).
    if (rgbMax > 0 && rgbMax < 255) {
      return rgbMax;
    }

    // White mask: coverage lives in alpha (Design 2 layer 1).
    if (rgbMax >= 250) {
      return a;
    }
  }

  return Math.max(rgbMax, a);
};

const isCanvasImageSource = (image: unknown): image is CanvasImageSource => {
  if (image instanceof HTMLImageElement) return true;
  if (image instanceof HTMLCanvasElement) return true;
  if (image instanceof HTMLVideoElement) return true;
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) return true;
  if (typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas) return true;
  return false;
};

const resolveMaskImage = (texture: Texture): { image: CanvasImageSource; width: number; height: number } | null => {
  const image = texture.image;
  if (!isCanvasImageSource(image)) return null;

  const width = 'naturalWidth' in image && image.naturalWidth ? image.naturalWidth : 'width' in image ? Number(image.width) : 0;
  const height = 'naturalHeight' in image && image.naturalHeight ? image.naturalHeight : 'height' in image ? Number(image.height) : 0;

  if (!width || !height) return null;

  return { image, width, height };
};

const readMaskPixels = (texture: Texture, width: number, height: number) => {
  const source = resolveMaskImage(texture);
  if (!source) return null;

  const scratch = document.createElement('canvas');
  scratch.width = width;
  scratch.height = height;

  const context = scratch.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.clearRect(0, 0, width, height);
  context.drawImage(source.image, 0, 0, width, height);

  return context.getImageData(0, 0, width, height);
};

const packPatternMaskChannels = (mask0: Texture, mask1: Texture, targetCanvas?: HTMLCanvasElement, targetTexture?: Texture | null): Texture => {
  const source0 = resolveMaskImage(mask0);
  if (!source0) return getEmptyPrintTexture();

  const { width, height } = source0;
  const mask0Pixels = readMaskPixels(mask0, width, height);
  if (!mask0Pixels) return getEmptyPrintTexture();

  const mask1Pixels = readMaskPixels(mask1, width, height);
  const canvas = targetCanvas ?? document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const outCtx = canvas.getContext('2d', { willReadFrequently: true });
  if (!outCtx) return getEmptyPrintTexture();

  const packed = outCtx.createImageData(width, height);

  for (let index = 0; index < mask0Pixels.data.length; index += 4) {
    packed.data[index] = readMaskAlpha(mask0Pixels.data, index);
    packed.data[index + 1] = mask1Pixels ? readMaskAlpha(mask1Pixels.data, index) : 0;
    packed.data[index + 2] = 0;
    packed.data[index + 3] = 255;
  }

  outCtx.putImageData(packed, 0, 0);

  if (targetTexture) {
    targetTexture.image = canvas;
    targetTexture.needsUpdate = true;
    return targetTexture;
  }

  return canvasToMaskTexture(canvas);
};

export { packPatternMaskChannels };
