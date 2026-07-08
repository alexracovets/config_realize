'use client';

import { composeOrderCuttingExportDownloadFile } from '@utils/composeOrderCuttingExportDownloadFile';
import type { orderCuttingExportType } from '@types';

type uvExportBlobType = {
  cartItemId: string;
  label: string;
  fileName: string;
  blob: Blob;
};

/** Composes and collects every downloadable UV texture already surfaced in the cutting-export document, as Blobs. */
const collectOrderCuttingExportUvBlobs = async (exportData: orderCuttingExportType): Promise<uvExportBlobType[]> => {
  const results: uvExportBlobType[] = [];

  for (const product of exportData.products) {
    for (const step of product.steps) {
      for (const file of step.downloadFiles) {
        let objectUrl: string | null = null;

        try {
          objectUrl = await composeOrderCuttingExportDownloadFile(file);
          if (!objectUrl) continue;

          const blob = await (await fetch(objectUrl)).blob();
          results.push({ cartItemId: product.cartItemId, label: file.label, fileName: file.fileName, blob });
        } catch {
          continue;
        } finally {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
      }
    }
  }

  return results;
};

export { collectOrderCuttingExportUvBlobs };
export type { uvExportBlobType };
