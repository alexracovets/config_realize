'use client';

import { loadCachedImage } from '@configurator/utils';
import type { orderCuttingExportDesignLayerSpecType } from '@types';

type rgbColorType = { r: number; g: number; b: number };

const hexToRgb = (hex: string): rgbColorType => {
  const normalized = hex.replace('#', '').trim();
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const resolveMaskAlpha = (r: number, g: number, b: number, a: number): number => {
  if (a < 250) return a / 255;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return Math.max(0, Math.min(1, 1 - luminance));
};

const readMaskImageData = async (maskSrc: string): Promise<ImageData> => {
  const image = await loadCachedImage(maskSrc);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
};

const composeDesignLayerPixels = (maskData: ImageData, color: string, opacity: number): Uint8ClampedArray => {
  const { r, g, b } = hexToRgb(color);
  const output = new Uint8ClampedArray(maskData.data.length);

  for (let index = 0; index < maskData.data.length; index += 4) {
    const maskAlpha = resolveMaskAlpha(maskData.data[index], maskData.data[index + 1], maskData.data[index + 2], maskData.data[index + 3]) * opacity;
    const alpha = Math.round(maskAlpha * 255);

    output[index] = r;
    output[index + 1] = g;
    output[index + 2] = b;
    output[index + 3] = alpha;
  }

  return output;
};

const composeDesignMixPixels = (maskLayers: ImageData[], colors: string[], opacity: number): Uint8ClampedArray => {
  const width = maskLayers[0]?.width ?? 0;
  const height = maskLayers[0]?.height ?? 0;
  const output = new Uint8ClampedArray(width * height * 4);
  const rgbColors = colors.map(hexToRgb);

  for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4;
    let blendedR = 0;
    let blendedG = 0;
    let blendedB = 0;
    let blendedAlpha = 0;

    maskLayers.forEach((maskData, layerIndex) => {
      const color = rgbColors[layerIndex] ?? rgbColors[0];
      const layerAlpha =
        resolveMaskAlpha(maskData.data[dataIndex], maskData.data[dataIndex + 1], maskData.data[dataIndex + 2], maskData.data[dataIndex + 3]) * opacity;

      blendedR = color.r * layerAlpha + blendedR * (1 - layerAlpha);
      blendedG = color.g * layerAlpha + blendedG * (1 - layerAlpha);
      blendedB = color.b * layerAlpha + blendedB * (1 - layerAlpha);
      blendedAlpha = layerAlpha + blendedAlpha * (1 - layerAlpha);
    });

    if (blendedAlpha > 0) {
      output[dataIndex] = Math.round(blendedR / blendedAlpha);
      output[dataIndex + 1] = Math.round(blendedG / blendedAlpha);
      output[dataIndex + 2] = Math.round(blendedB / blendedAlpha);
      output[dataIndex + 3] = Math.round(blendedAlpha * 255);
    }
  }

  return output;
};

const imageDataToBlobUrl = (imageData: ImageData): Promise<string> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Canvas 2D context is not available.'));
      return;
    }

    context.putImageData(imageData, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export composed design preview.'));
          return;
        }

        resolve(URL.createObjectURL(blob));
      },
      'image/png',
      1,
    );
  });

const composeDesignUvLayerPreview = async (maskSrc: string, color: string, opacity: number): Promise<string> => {
  const maskData = await readMaskImageData(maskSrc);
  const pixels = composeDesignLayerPixels(maskData, color, opacity);

  return imageDataToBlobUrl(new ImageData(new Uint8ClampedArray(pixels), maskData.width, maskData.height));
};

const composeDesignUvMixPreview = async (layers: orderCuttingExportDesignLayerSpecType[], opacity: number): Promise<string> => {
  const maskLayers = await Promise.all(layers.map((layer) => readMaskImageData(layer.maskSrc)));
  const pixels = composeDesignMixPixels(
    maskLayers,
    layers.map((layer) => layer.color),
    opacity,
  );

  const width = maskLayers[0]?.width ?? 0;
  const height = maskLayers[0]?.height ?? 0;

  return imageDataToBlobUrl(new ImageData(new Uint8ClampedArray(pixels), width, height));
};

export { composeDesignUvLayerPreview, composeDesignUvMixPreview };
