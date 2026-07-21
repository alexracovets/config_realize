'use client';

import { pdf } from '@react-pdf/renderer';

import type { checkoutOrderExportType } from '@types';
import { CHECKOUT_ORDER_EXPORT_LOGO_SRC } from '@constants';
import { rasterizeImageForPdf, rasterizeImagesForPdf } from '@utils/exportPdfAssets';

import { CheckoutOrderExportPdfDocument } from '@utils/buildCheckoutOrderExportPdf/CheckoutOrderExportPdfDocument';
import type { checkoutOrderExportPdfImagesType } from '@utils/buildCheckoutOrderExportPdf/CheckoutOrderExportPdfDocument';

const prepareCheckoutOrderExportPdfImages = async (exportData: checkoutOrderExportType): Promise<checkoutOrderExportPdfImagesType> => {
  const [logoSrc, previewBySrc] = await Promise.all([
    rasterizeImageForPdf(CHECKOUT_ORDER_EXPORT_LOGO_SRC),
    rasterizeImagesForPdf(exportData.lines.map((line) => line.previewSrc)),
  ]);

  return { logoSrc, previewBySrc };
};

const buildCheckoutOrderExportPdfBlob = async (exportData: checkoutOrderExportType): Promise<Blob> => {
  const images = await prepareCheckoutOrderExportPdfImages(exportData);
  return pdf(<CheckoutOrderExportPdfDocument exportData={exportData} images={images} />).toBlob();
};

export { buildCheckoutOrderExportPdfBlob };
