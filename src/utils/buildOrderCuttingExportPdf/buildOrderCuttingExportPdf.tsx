'use client';

import { pdf } from '@react-pdf/renderer';

import type { orderCuttingExportType } from '@types';
import type { cuttingExportDownloadUrlEntryType } from '@utils/applyCuttingExportDownloadUrls';
import { isPdfReadyImageSrc, rasterizeImagesForPdf } from '@utils/exportPdfAssets';

import { buildDownloadPreviewKey, OrderCuttingExportPdfDocument } from '@utils/buildOrderCuttingExportPdf/OrderCuttingExportPdfDocument';
import type { orderCuttingExportPdfImagesType } from '@utils/buildOrderCuttingExportPdf/OrderCuttingExportPdfDocument';

type buildOrderCuttingExportPdfBlobOptionsType = {
  /** Composed UV textures (PNG data URLs) keyed by cart item + label, produced at submit time. */
  downloadUrls?: cuttingExportDownloadUrlEntryType[];
  /** Public https URLs of the same assets (already uploaded) — become clickable link targets in the PDF. */
  linkUrls?: cuttingExportDownloadUrlEntryType[];
};

const prepareOrderCuttingExportPdfImages = async (
  exportData: orderCuttingExportType,
  downloadUrls: cuttingExportDownloadUrlEntryType[],
  linkUrls: cuttingExportDownloadUrlEntryType[],
): Promise<orderCuttingExportPdfImagesType> => {
  const downloadPreviewByKey = new Map<string, string | null>();
  const downloadLinkByKey = new Map<string, string>();

  linkUrls.forEach((entry) => {
    if (/^https?:/i.test(entry.url)) {
      downloadLinkByKey.set(buildDownloadPreviewKey(entry.cartItemId, entry.label), entry.url);
    }
  });

  downloadUrls.forEach((entry) => {
    if (isPdfReadyImageSrc(entry.url)) {
      downloadPreviewByKey.set(buildDownloadPreviewKey(entry.cartItemId, entry.label), entry.url);
    }
  });

  const fallbackSources = exportData.products.flatMap((product) =>
    product.steps.flatMap((step) =>
      step.downloadFiles.flatMap((file) => {
        const hasComposedPreview = downloadPreviewByKey.has(buildDownloadPreviewKey(product.cartItemId, file.label));
        return !hasComposedPreview && file.previewSrc ? [file.previewSrc] : [];
      }),
    ),
  );

  const rasterizedFallbacks = await rasterizeImagesForPdf(fallbackSources);
  rasterizedFallbacks.forEach((value, key) => downloadPreviewByKey.set(key, value));

  return { downloadPreviewByKey, downloadLinkByKey };
};

/** Renders the cutting-pattern PDF (vector text, auto-paginated, embedded UV previews) from export data. */
const buildOrderCuttingExportPdfBlob = async (exportData: orderCuttingExportType, options: buildOrderCuttingExportPdfBlobOptionsType = {}): Promise<Blob> => {
  const images = await prepareOrderCuttingExportPdfImages(exportData, options.downloadUrls ?? [], options.linkUrls ?? []);
  return pdf(<OrderCuttingExportPdfDocument exportData={exportData} images={images} />).toBlob();
};

export { buildOrderCuttingExportPdfBlob };
export type { buildOrderCuttingExportPdfBlobOptionsType };
