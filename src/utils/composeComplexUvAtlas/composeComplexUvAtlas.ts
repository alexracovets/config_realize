'use client';

import type { orderCuttingExportDownloadFileType, orderCuttingExportLogoStampSpecType } from '@types';
import { loadCachedImage, resolveLogoDrawSize, resolveRasterDesignSrc } from '@configurator/utils';
import { composeGarmentColorUvAtlas } from '@utils/composeGarmentColorUvAtlas';
import { composeDesignUvLayerPreview, composeDesignUvMixPreview } from '@utils/composeDesignUvPreview';
import { drawTextUvLayersOnCanvas } from '@utils/composeTextUvLayer';
import { canvasToPngBlobUrl } from '@utils/logoFile/canvasToBlobUrl';

const DEFAULT_LOGOS_ALPHA_THRESHOLD = 128;

const revokeObjectUrl = (url: string | null) => {
  if (url) URL.revokeObjectURL(url);
};

const drawBlobUrlOntoCanvas = async (ctx: CanvasRenderingContext2D, url: string, width: number, height: number) => {
  const image = await loadCachedImage(url);
  ctx.drawImage(image, 0, 0, width, height);
};

const drawDesignOverlay = async (ctx: CanvasRenderingContext2D, file: orderCuttingExportDownloadFileType, width: number, height: number) => {
  const layers = file.layers ?? [];
  if (layers.length === 0) return;

  const opacity = file.opacity ?? 1;
  const overlayUrl =
    layers.length === 1 ? await composeDesignUvLayerPreview(layers[0].maskSrc, layers[0].color, opacity) : await composeDesignUvMixPreview(layers, opacity);

  try {
    await drawBlobUrlOntoCanvas(ctx, overlayUrl, width, height);
  } finally {
    revokeObjectUrl(overlayUrl);
  }
};

const drawLogoStamp = async (ctx: CanvasRenderingContext2D, stamp: orderCuttingExportLogoStampSpecType, atlasWidth: number, atlasHeight: number) => {
  try {
    const image = await loadCachedImage(stamp.src);
    const naturalWidth = stamp.naturalWidth || image.naturalWidth || 1;
    const naturalHeight = stamp.naturalHeight || image.naturalHeight || 1;
    const { width, height } = resolveLogoDrawSize({ scale: stamp.scale }, naturalWidth, naturalHeight, atlasWidth);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(stamp.uv.x * atlasWidth, stamp.uv.y * atlasHeight);
    ctx.rotate((stamp.rotation * Math.PI) / 180);
    ctx.globalAlpha = stamp.opacity;
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  } catch {
    return;
  }
};

const drawDefaultLogosOverlay = async (ctx: CanvasRenderingContext2D, src: string, width: number, height: number) => {
  try {
    const image = await loadCachedImage(resolveRasterDesignSrc(src));
    const temp = document.createElement('canvas');
    temp.width = width;
    temp.height = height;
    const tempCtx = temp.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(image, 0, 0, width, height);
    const imageData = tempCtx.getImageData(0, 0, width, height);

    for (let index = 3; index < imageData.data.length; index += 4) {
      imageData.data[index] = imageData.data[index] >= DEFAULT_LOGOS_ALPHA_THRESHOLD ? 255 : 0;
    }

    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(temp, 0, 0);
  } catch {
    return;
  }
};

const composeComplexUvAtlas = async (file: orderCuttingExportDownloadFileType): Promise<string> => {
  const atlasWidth = file.atlasWidth ?? 0;
  const atlasHeight = file.atlasHeight ?? 0;
  const modelSrc = file.modelSrc;
  const colorParts = file.colorParts ?? [];

  if (!modelSrc || colorParts.length === 0 || atlasWidth <= 0 || atlasHeight <= 0) {
    throw new Error('Complex UV atlas is missing color source data.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = atlasWidth;
  canvas.height = atlasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available.');

  const colorAtlasUrl = await composeGarmentColorUvAtlas(modelSrc, atlasWidth, atlasHeight, colorParts);
  try {
    await drawBlobUrlOntoCanvas(ctx, colorAtlasUrl, atlasWidth, atlasHeight);
  } finally {
    revokeObjectUrl(colorAtlasUrl);
  }

  try {
    await drawDesignOverlay(ctx, file, atlasWidth, atlasHeight);
  } catch {
    // Keep the color atlas even if a design mask fails to load.
  }

  for (const stamp of file.logoStamps ?? []) {
    await drawLogoStamp(ctx, stamp, atlasWidth, atlasHeight);
  }

  await drawTextUvLayersOnCanvas(ctx, atlasWidth, atlasHeight, file.textLayers ?? []);

  if (file.defaultLogosSrc) {
    await drawDefaultLogosOverlay(ctx, file.defaultLogosSrc, atlasWidth, atlasHeight);
  }

  return canvasToPngBlobUrl(canvas);
};

export { composeComplexUvAtlas };
