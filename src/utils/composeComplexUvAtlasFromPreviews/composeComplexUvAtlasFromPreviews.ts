import sharp from 'sharp';

import { resolveLogoDrawSize } from '@configurator/utils';
import type { garmentConfigType, orderCuttingExportLogoStampSpecType, orderCuttingExportProductType } from '@types';
import { getModel } from '@utils/garmentCatalog/garmentCatalog';

type complexUvPreviewLayerType = {
  cartItemId: string;
  label: string;
  dataUrl: string;
};

type composeComplexUvAtlasFromPreviewsInputType = {
  layers: Array<{ label: string; dataUrl: string }>;
  defaultLogosPath?: string | null;
  logoStamps?: orderCuttingExportLogoStampSpecType[];
  logoDataUrlByFileName?: Map<string, string>;
  atlasWidth?: number;
  atlasHeight?: number;
};

const COMPLEX_PREVIEW_LABEL = 'UV Complex';

const isBaseLayerLabel = (label: string) => label === 'UV Sfumatura' || label === 'UV Colore';
const isDesignLayerLabel = (label: string) => label === 'MIX' || /^Texture \d+$/.test(label);
const isTextLayerLabel = (label: string) => label === 'UV Stampa';
const isComplexLayerLabel = (label: string) => label === COMPLEX_PREVIEW_LABEL;

const dataUrlToBuffer = (dataUrl: string): Buffer => {
  const match = /^data:[^;]+;base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid image data URL.');
  return Buffer.from(match[1], 'base64');
};

const pngBufferFromDataUrl = (dataUrl: string): Buffer => dataUrlToBuffer(dataUrl);

const bufferToPngDataUrl = (buffer: Buffer) => `data:image/png;base64,${buffer.toString('base64')}`;

// public/ assets are read over HTTP (not from disk) so Next's file tracer does not bundle
// the whole public/ tree — 135 MB of design SVGs — into serverless function output.
const resolvePublicAssetOrigin = (): string => (process.env.APP_ORIGIN ?? process.env.APP_URL ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');

const toPublicAssetUrl = (relativePath: string): string => `${resolvePublicAssetOrigin()}/${relativePath.replace(/^\/+/, '').split('?')[0]}`;

const fetchPublicAssetBuffer = async (url: string): Promise<Buffer | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
};

const resolveDefaultLogosAssetUrl = (model: garmentConfigType | undefined): string | null => {
  const fileName = model?.default_pattern?.[0]?.parts[0]?.path_name;
  if (!fileName || !model) return null;

  // The catalog may name the file .webp or .svg; prefer .svg (vector, crisp when rasterized).
  const svgName = fileName.replace(/\.webp$/i, '.svg');
  return toPublicAssetUrl(`${model.path.replace(/^\/+/, '')}/designs/${svgName}`);
};

const resolveOverlayLayers = (layers: Array<{ label: string; dataUrl: string }>) => {
  const hasMix = layers.some((layer) => layer.label === 'MIX');
  const usable = layers.filter((layer) => {
    if (isComplexLayerLabel(layer.label) || isBaseLayerLabel(layer.label)) return false;
    if (hasMix && isDesignLayerLabel(layer.label) && layer.label !== 'MIX') return false;
    return isDesignLayerLabel(layer.label) || isTextLayerLabel(layer.label);
  });

  return [...usable.filter((layer) => isDesignLayerLabel(layer.label)), ...usable.filter((layer) => isTextLayerLabel(layer.label))];
};

const resizePng = async (input: Buffer, width: number, height: number) => sharp(input).ensureAlpha().resize(width, height, { fit: 'fill' }).png().toBuffer();

const punchOpaqueBlackBackground = async (input: Buffer) => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparentCount = 0;

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 250) transparentCount += 1;
  }

  if (transparentCount > 0) {
    return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toBuffer();
  }

  for (let index = 0; index < data.length; index += 4) {
    if (data[index] < 12 && data[index + 1] < 12 && data[index + 2] < 12) {
      data[index + 3] = 0;
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
};

const thresholdDefaultLogosAlpha = async (input: Buffer, width: number, height: number) => {
  const resized = await sharp(input).ensureAlpha().resize(width, height, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const pixels = resized.data;

  for (let index = 3; index < pixels.length; index += 4) {
    pixels[index] = pixels[index] >= 128 ? 255 : 0;
  }

  return sharp(pixels, { raw: { width: resized.info.width, height: resized.info.height, channels: 4 } })
    .png()
    .toBuffer();
};

const isHttpUrl = (src: string) => /^https?:/i.test(src);
const isDataUrl = (src: string) => /^data:/i.test(src);
const isPublicAssetPath = (src: string) => src.startsWith('/') && !src.startsWith('//');

const applyStampOpacity = async (input: Buffer, opacity: number) => {
  if (opacity >= 1) return input;

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = Math.max(0, Math.min(1, opacity));

  for (let index = 3; index < data.length; index += 4) {
    data[index] = Math.round(data[index] * alpha);
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
};

const readPublicAssetBuffer = async (src: string): Promise<Buffer | null> => {
  const relativePath = src.replace(/^\//, '').split('?')[0];
  if (!relativePath) return null;

  const buffer = await fetchPublicAssetBuffer(toPublicAssetUrl(relativePath));
  if (!buffer) return null;

  return sharp(buffer).ensureAlpha().png().toBuffer();
};

const loadStampSourceBuffer = async (
  stamp: orderCuttingExportLogoStampSpecType,
  layers: Array<{ label: string; dataUrl: string }>,
  logoDataUrlByFileName?: Map<string, string>,
): Promise<Buffer | null> => {
  const src = stamp.src.trim();

  if (isDataUrl(src)) {
    try {
      return dataUrlToBuffer(src);
    } catch {
      return null;
    }
  }

  if (isHttpUrl(src)) {
    try {
      const response = await fetch(src);
      if (response.ok) return Buffer.from(await response.arrayBuffer());
    } catch {
      // Fall through to uploaded preview layers / public files.
    }
  }

  const layer = stamp.label ? layers.find((item) => item.label === stamp.label) : undefined;
  if (layer) {
    try {
      return dataUrlToBuffer(layer.dataUrl);
    } catch {
      return null;
    }
  }

  if (stamp.fileName) {
    const shared = logoDataUrlByFileName?.get(stamp.fileName);
    if (shared) {
      try {
        return dataUrlToBuffer(shared);
      } catch {
        return null;
      }
    }
  }

  if (isPublicAssetPath(src)) return readPublicAssetBuffer(src);

  return null;
};

const clipOverlayToAtlas = async (input: Buffer, left: number, top: number, atlasWidth: number, atlasHeight: number): Promise<sharp.OverlayOptions | null> => {
  const meta = await sharp(input).metadata();
  const overlayWidth = meta.width ?? 0;
  const overlayHeight = meta.height ?? 0;
  const destLeft = Math.max(0, left);
  const destTop = Math.max(0, top);
  const srcLeft = Math.max(0, -left);
  const srcTop = Math.max(0, -top);
  const width = Math.min(overlayWidth - srcLeft, atlasWidth - destLeft);
  const height = Math.min(overlayHeight - srcTop, atlasHeight - destTop);
  if (width < 1 || height < 1) return null;

  const clipped =
    srcLeft === 0 && srcTop === 0 && width === overlayWidth && height === overlayHeight
      ? input
      : await sharp(input).extract({ left: srcLeft, top: srcTop, width, height }).png().toBuffer();

  return { input: clipped, left: destLeft, top: destTop, blend: 'over' };
};

const buildLogoStampOverlays = async (
  stamps: orderCuttingExportLogoStampSpecType[],
  layers: Array<{ label: string; dataUrl: string }>,
  atlasWidth: number,
  atlasHeight: number,
  logoDataUrlByFileName?: Map<string, string>,
) => {
  const overlays: sharp.OverlayOptions[] = [];

  for (const stamp of stamps) {
    try {
      const input = await loadStampSourceBuffer(stamp, layers, logoDataUrlByFileName);
      if (!input) continue;

      const metadata = await sharp(input).metadata();
      const naturalWidth = stamp.naturalWidth || metadata.width || 1;
      const naturalHeight = stamp.naturalHeight || metadata.height || 1;
      const size = resolveLogoDrawSize({ scale: stamp.scale }, naturalWidth, naturalHeight, atlasWidth);
      const stampWidth = Math.max(1, Math.round(size.width));
      const stampHeight = Math.max(1, Math.round(size.height));
      const resized = await applyStampOpacity(
        await sharp(input)
          .ensureAlpha()
          .resize(stampWidth, stampHeight)
          .rotate(stamp.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        stamp.opacity,
      );
      const rotated = await sharp(resized).metadata();
      const overlayWidth = rotated.width ?? stampWidth;
      const overlayHeight = rotated.height ?? stampHeight;
      const overlay = await clipOverlayToAtlas(
        resized,
        Math.round(stamp.uv.x * atlasWidth - overlayWidth / 2),
        Math.round(stamp.uv.y * atlasHeight - overlayHeight / 2),
        atlasWidth,
        atlasHeight,
      );

      if (overlay) overlays.push(overlay);
    } catch {
      continue;
    }
  }

  return overlays;
};

const compositeAtlas = async (baseBuffer: Buffer, width: number, height: number, inputs: sharp.OverlayOptions[]) => {
  const resizedBase = await sharp(baseBuffer).ensureAlpha().resize(width, height, { fit: 'fill' }).png().toBuffer();

  try {
    return await sharp(resizedBase).composite(inputs).png().toBuffer();
  } catch {
    let atlas = resizedBase;

    for (const overlay of inputs) {
      try {
        atlas = await sharp(atlas).composite([overlay]).png().toBuffer();
      } catch {
        continue;
      }
    }

    return atlas;
  }
};

const composeComplexUvAtlasFromPreviews = async ({
  layers,
  defaultLogosPath,
  logoStamps = [],
  logoDataUrlByFileName,
  atlasWidth,
  atlasHeight,
}: composeComplexUvAtlasFromPreviewsInputType): Promise<string | null> => {
  const base = [...layers].reverse().find((layer) => isBaseLayerLabel(layer.label));
  if (!base) return null;

  const overlays = resolveOverlayLayers(layers);
  const designOverlays = overlays.filter((layer) => isDesignLayerLabel(layer.label));
  const textOverlays = overlays.filter((layer) => isTextLayerLabel(layer.label));

  const baseBuffer = dataUrlToBuffer(base.dataUrl);
  const baseMeta = await sharp(baseBuffer).metadata();
  const width = atlasWidth || baseMeta.width;
  const height = atlasHeight || baseMeta.height;
  if (!width || !height) return null;

  const compositeInputs: sharp.OverlayOptions[] = [];

  for (const overlay of designOverlays) {
    compositeInputs.push({ input: await resizePng(dataUrlToBuffer(overlay.dataUrl), width, height), blend: 'over' });
  }

  compositeInputs.push(...(await buildLogoStampOverlays(logoStamps, layers, width, height, logoDataUrlByFileName)));

  for (const overlay of textOverlays) {
    const punched = await punchOpaqueBlackBackground(dataUrlToBuffer(overlay.dataUrl));
    compositeInputs.push({ input: await resizePng(punched, width, height), blend: 'over' });
  }

  if (defaultLogosPath) {
    try {
      const defaultLogosBuffer = /^https?:/i.test(defaultLogosPath) ? await fetchPublicAssetBuffer(defaultLogosPath) : null;
      if (!defaultLogosBuffer) throw new Error('default logos asset unavailable');

      compositeInputs.push({
        input: await thresholdDefaultLogosAlpha(await sharp(defaultLogosBuffer).ensureAlpha().png().toBuffer(), width, height),
        blend: 'over',
      });
    } catch {
      // Keep the stitched atlas when the baked Realize logos file is missing.
    }
  }

  return bufferToPngDataUrl(await compositeAtlas(baseBuffer, width, height, compositeInputs));
};

const fillMissingComplexUvPreviews = async ({
  products,
  layers,
  downloadPreviewByKey,
  overwrite = false,
}: {
  products: orderCuttingExportProductType[];
  layers: complexUvPreviewLayerType[];
  downloadPreviewByKey: Map<string, string | null>;
  overwrite?: boolean;
}) => {
  const logoDataUrlByFileName = new Map<string, string>();

  for (const product of products) {
    const stamps = product.steps?.find((step) => step.key === 'complex')?.downloadFiles[0]?.logoStamps ?? [];
    const productLayers = layers.filter((layer) => layer.cartItemId === product.cartItemId);

    for (const stamp of stamps) {
      if (!stamp.fileName || logoDataUrlByFileName.has(stamp.fileName)) continue;
      const layer = stamp.label ? productLayers.find((item) => item.label === stamp.label) : undefined;
      if (layer) logoDataUrlByFileName.set(stamp.fileName, layer.dataUrl);
    }
  }

  for (const product of products) {
    const previewKey = `${product.cartItemId}:${COMPLEX_PREVIEW_LABEL}`;
    if (!overwrite && downloadPreviewByKey.get(previewKey)) continue;

    const complexFile = product.steps?.find((step) => step.key === 'complex')?.downloadFiles[0];
    const dataUrl = await composeComplexUvAtlasFromPreviews({
      layers: layers.filter((layer) => layer.cartItemId === product.cartItemId),
      defaultLogosPath: resolveDefaultLogosAssetUrl(getModel(product.modelId)),
      logoStamps: complexFile?.logoStamps,
      logoDataUrlByFileName,
      atlasWidth: complexFile?.atlasWidth ?? product.printAtlas?.width,
      atlasHeight: complexFile?.atlasHeight ?? product.printAtlas?.height,
    });

    if (dataUrl) downloadPreviewByKey.set(previewKey, dataUrl);
  }
};

export { COMPLEX_PREVIEW_LABEL, composeComplexUvAtlasFromPreviews, fillMissingComplexUvPreviews, pngBufferFromDataUrl, resolveDefaultLogosAssetUrl };
export type { complexUvPreviewLayerType, composeComplexUvAtlasFromPreviewsInputType };
