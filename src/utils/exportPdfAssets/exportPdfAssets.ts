'use client';

import { resolveAbsoluteAssetUrl } from '@utils/resolveAbsoluteAssetUrl';

const EXPORT_PDF_IMAGE_LOAD_TIMEOUT_MS = 8_000;
const EXPORT_PDF_IMAGE_FALLBACK_SIZE_PX = 256;

const isPdfReadyImageSrc = (src: string) => /^data:image\/(?:png|jpe?g);/i.test(src);

const loadImageElement = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`Image load timed out: ${src.slice(0, 120)}`));
    }, EXPORT_PDF_IMAGE_LOAD_TIMEOUT_MS);

    image.crossOrigin = 'anonymous';
    image.onload = () => {
      window.clearTimeout(timeoutId);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error(`Image failed to load: ${src.slice(0, 120)}`));
    };
    image.src = src;
  });

const rasterizeImageForPdf = async (src: string): Promise<string | null> => {
  if (!src) return null;
  if (isPdfReadyImageSrc(src)) return src;

  try {
    const image = await loadImageElement(resolveAbsoluteAssetUrl(src));
    const width = image.naturalWidth || EXPORT_PDF_IMAGE_FALLBACK_SIZE_PX;
    const height = image.naturalHeight || EXPORT_PDF_IMAGE_FALLBACK_SIZE_PX;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('PDF image rasterization failed', error);
    return null;
  }
};

const rasterizeImagesForPdf = async (sources: string[]): Promise<Map<string, string | null>> => {
  const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
  const entries = await Promise.all(uniqueSources.map(async (source) => [source, await rasterizeImageForPdf(source)] as const));
  return new Map(entries);
};

export { isPdfReadyImageSrc, rasterizeImageForPdf, rasterizeImagesForPdf };
