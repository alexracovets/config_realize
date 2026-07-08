'use client';

import { pdf } from '@react-pdf/renderer';

import type { checkoutOrderExportType } from '@types';
import { CHECKOUT_ORDER_EXPORT_LOGO_SRC } from '@constants';
import { rasterizeImageForPdf, rasterizeImagesForPdf } from '@utils/exportPdfAssets';

import { CheckoutOrderExportPdfDocument } from './CheckoutOrderExportPdfDocument';
import type { checkoutOrderExportPdfImagesType } from './CheckoutOrderExportPdfDocument';

const prepareCheckoutOrderExportPdfImages = async (
  exportData: checkoutOrderExportType,
): Promise<checkoutOrderExportPdfImagesType> => {
  const [logoSrc, previewBySrc] = await Promise.all([
    rasterizeImageForPdf(CHECKOUT_ORDER_EXPORT_LOGO_SRC),
    rasterizeImagesForPdf(exportData.lines.map((line) => line.previewSrc)),
  ]);

  return { logoSrc, previewBySrc };
};

/** Renders the order-confirmation PDF (vector text, selectable, auto-paginated) from checkout export data. */
const buildCheckoutOrderExportPdfBlob = async (exportData: checkoutOrderExportType): Promise<Blob> => {
  const images = await prepareCheckoutOrderExportPdfImages(exportData);
  return pdf(<CheckoutOrderExportPdfDocument exportData={exportData} images={images} />).toBlob();
};

export { buildCheckoutOrderExportPdfBlob };
