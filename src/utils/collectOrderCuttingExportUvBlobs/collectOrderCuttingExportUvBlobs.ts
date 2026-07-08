'use client';

import { composeGarmentColorUvAtlas } from '@utils/composeGarmentColorUvAtlas';
import { composeDesignUvLayerPreview, composeDesignUvMixPreview } from '@utils/composeDesignUvPreview';
import { composeTextUvLayer } from '@utils/composeTextUvLayer';
import type { orderCuttingExportDownloadFileType, orderCuttingExportType } from '@types';

type uvExportBlobType = {
  cartItemId: string;
  label: string;
  fileName: string;
  blob: Blob;
};

/** Mirrors `OrderCuttingExportDownloadCard`'s compose logic to produce a Blob instead of a preview `<img>` src. */
const composeDownloadFile = async (file: orderCuttingExportDownloadFileType): Promise<string | null> => {
  if (file.composeKind === 'design-layer' && file.maskSrc && file.color) {
    return composeDesignUvLayerPreview(file.maskSrc, file.color, file.opacity ?? 1);
  }

  if (file.composeKind === 'design-mix' && file.layers?.length) {
    return composeDesignUvMixPreview(file.layers, file.opacity ?? 1);
  }

  if ((file.composeKind === 'color-atlas' || file.composeKind === 'gradient-atlas') && file.modelSrc && file.colorParts?.length && file.atlasWidth && file.atlasHeight) {
    return composeGarmentColorUvAtlas(file.modelSrc, file.atlasWidth, file.atlasHeight, file.colorParts);
  }

  if (file.composeKind === 'text-layer' && file.textLayers?.length && file.atlasWidth && file.atlasHeight) {
    return composeTextUvLayer(file.atlasWidth, file.atlasHeight, file.textLayers);
  }

  return null;
};

/** Composes and collects every downloadable UV texture already surfaced in the cutting-export document, as Blobs. */
const collectOrderCuttingExportUvBlobs = async (exportData: orderCuttingExportType): Promise<uvExportBlobType[]> => {
  const results: uvExportBlobType[] = [];

  for (const product of exportData.products) {
    for (const step of product.steps) {
      for (const file of step.downloadFiles) {
        let objectUrl: string | null = null;

        try {
          objectUrl = await composeDownloadFile(file);
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
