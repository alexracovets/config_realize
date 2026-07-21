import type { cuttingExportDownloadUrlEntryType } from '@utils/applyCuttingExportDownloadUrls';
import type { uvExportBlobType } from '@utils/collectOrderCuttingExportUvBlobs';

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read UV texture blob.'));
    reader.readAsDataURL(blob);
  });

const buildCuttingExportDownloadUrlsFromUvBlobs = async (uvBlobs: uvExportBlobType[]): Promise<cuttingExportDownloadUrlEntryType[]> =>
  Promise.all(
    uvBlobs.map(async (uv) => ({
      cartItemId: uv.cartItemId,
      label: uv.label,
      url: await blobToDataUrl(uv.blob),
    })),
  );

export { buildCuttingExportDownloadUrlsFromUvBlobs };
