'use client';

import {
  addExportPdfPageNumbers,
  appendCanvasToExportPdf,
  captureExportPageCanvas,
  createExportPdf,
  triggerExportPdfDownload,
  waitForExportImages,
} from '@utils/exportPdfCapture';

import {
  ORDER_EXPORT_PAGE_HEIGHT_PX,
  ORDER_EXPORT_PAGE_WIDTH_PX,
  paginateOrderExportDocument,
} from './paginateOrderExportDocument';

const ORDER_EXPORT_JPEG_QUALITY = 0.84;

const getCapturePages = (captureRoot: HTMLElement) => {
  if (captureRoot.classList.contains('order-export-pages')) {
    return Array.from(captureRoot.querySelectorAll('.order-export-page')).filter(
      (page): page is HTMLElement => page instanceof HTMLElement,
    );
  }

  return [captureRoot];
};

const buildCheckoutOrderExportPdfBlob = async (documentElement: HTMLElement): Promise<Blob> => {
  const captureRoot = paginateOrderExportDocument(documentElement);

  await waitForExportImages(captureRoot);

  const pages = getCapturePages(captureRoot);
  const pdf = createExportPdf();

  for (let index = 0; index < pages.length; index += 1) {
    const canvas = await captureExportPageCanvas(pages[index], {
      width: ORDER_EXPORT_PAGE_WIDTH_PX,
      height: ORDER_EXPORT_PAGE_HEIGHT_PX,
    });
    appendCanvasToExportPdf(pdf, canvas, index, ORDER_EXPORT_JPEG_QUALITY);
  }

  addExportPdfPageNumbers(pdf);
  return pdf.output('blob');
};

const downloadCheckoutOrderExportPdf = async (documentElement: HTMLElement, filename: string) => {
  const blob = await buildCheckoutOrderExportPdfBlob(documentElement);
  triggerExportPdfDownload(blob, filename);
};

export { buildCheckoutOrderExportPdfBlob, downloadCheckoutOrderExportPdf };
