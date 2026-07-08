import type { cuttingExportDownloadUrlEntryType } from '@utils/applyCuttingExportDownloadUrls';
import { composeOrderCuttingExportDownloadFile } from '@utils/composeOrderCuttingExportDownloadFile';
import { resolveAbsoluteAssetUrl } from '@utils/resolveAbsoluteAssetUrl';
import type { orderCuttingExportType } from '@types';

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read composed UV texture.'));
    reader.readAsDataURL(blob);
  });

const resolveExistingDownloadUrl = async (downloadUrl: string): Promise<string> => {
  if (/^(?:https?:|data:)/.test(downloadUrl)) {
    return downloadUrl;
  }

  if (downloadUrl.startsWith('blob:')) {
    return blobToDataUrl(await (await fetch(downloadUrl)).blob());
  }

  return resolveAbsoluteAssetUrl(downloadUrl);
};

const resolveCuttingExportDownloadUrl = async (
  cartItemId: string,
  file: orderCuttingExportType['products'][number]['steps'][number]['downloadFiles'][number],
): Promise<cuttingExportDownloadUrlEntryType | null> => {
  if (file.downloadUrl.trim()) {
    return {
      cartItemId,
      label: file.label,
      url: await resolveExistingDownloadUrl(file.downloadUrl),
    };
  }

  const objectUrl = await composeOrderCuttingExportDownloadFile(file);
  if (!objectUrl) return null;

  try {
    const blob = await (await fetch(objectUrl)).blob();
    return {
      cartItemId,
      label: file.label,
      url: await blobToDataUrl(blob),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/** Composes every downloadable UV texture in the export document and returns embeddable URLs for PDF links. */
const resolveCuttingExportDownloadUrls = async (exportData: orderCuttingExportType): Promise<cuttingExportDownloadUrlEntryType[]> => {
  const entries: cuttingExportDownloadUrlEntryType[] = [];

  for (const product of exportData.products) {
    for (const step of product.steps) {
      for (const file of step.downloadFiles) {
        const entry = await resolveCuttingExportDownloadUrl(product.cartItemId, file);
        if (entry) entries.push(entry);
      }
    }
  }

  return entries;
};

export { resolveCuttingExportDownloadUrls };
