'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import {
  ORDER_EXPORT_PAGE_HEIGHT_PX,
  ORDER_EXPORT_PAGE_WIDTH_PX,
  paginateOrderExportDocument,
} from './paginateOrderExportDocument';

const ORDER_EXPORT_PDF_WIDTH_MM = 210;
const ORDER_EXPORT_PDF_HEIGHT_MM = 297;
const ORDER_EXPORT_PDF_MARGIN_MM = 12;
const ORDER_EXPORT_PAGE_NUMBER_FONT_SIZE = 10;
const ORDER_EXPORT_CAPTURE_SCALE = 1;
const ORDER_EXPORT_JPEG_QUALITY = 0.84;

const waitForDocumentImages = (root: HTMLElement) =>
  Promise.all(
    Array.from(root.querySelectorAll('img')).map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );

const getCapturePages = (captureRoot: HTMLElement) => {
  if (captureRoot.classList.contains('order-export-pages')) {
    return Array.from(captureRoot.querySelectorAll('.order-export-page')).filter(
      (page): page is HTMLElement => page instanceof HTMLElement,
    );
  }

  return [captureRoot];
};

const capturePageCanvas = (pageElement: HTMLElement) =>
  html2canvas(pageElement, {
    scale: ORDER_EXPORT_CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: ORDER_EXPORT_PAGE_WIDTH_PX,
    height: ORDER_EXPORT_PAGE_HEIGHT_PX,
    windowWidth: ORDER_EXPORT_PAGE_WIDTH_PX,
    windowHeight: ORDER_EXPORT_PAGE_HEIGHT_PX,
  });

const encodePdfPageCanvas = (canvas: HTMLCanvasElement) => canvas.toDataURL('image/jpeg', ORDER_EXPORT_JPEG_QUALITY);

const appendCanvasToPdf = (pdf: jsPDF, canvas: HTMLCanvasElement, pageIndex: number) => {
  if (pageIndex > 0) {
    pdf.addPage();
  }

  pdf.addImage(
    encodePdfPageCanvas(canvas),
    'JPEG',
    0,
    0,
    ORDER_EXPORT_PDF_WIDTH_MM,
    ORDER_EXPORT_PDF_HEIGHT_MM,
    undefined,
    'FAST',
  );

  canvas.width = 0;
  canvas.height = 0;
};

const addPdfPageNumbers = (pdf: jsPDF) => {
  const totalPages = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(ORDER_EXPORT_PAGE_NUMBER_FONT_SIZE);
    pdf.setTextColor(129, 129, 129);
    pdf.text(`${page} / ${totalPages}`, pageWidth - ORDER_EXPORT_PDF_MARGIN_MM, pageHeight - 6, { align: 'right' });
  }
};

const buildCheckoutOrderExportPdfBlob = async (documentElement: HTMLElement): Promise<Blob> => {
  const captureRoot = paginateOrderExportDocument(documentElement);

  await waitForDocumentImages(captureRoot);

  const pages = getCapturePages(captureRoot);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  for (let index = 0; index < pages.length; index += 1) {
    const canvas = await capturePageCanvas(pages[index]);
    appendCanvasToPdf(pdf, canvas, index);
  }

  addPdfPageNumbers(pdf);
  return pdf.output('blob');
};

const downloadCheckoutOrderExportPdf = async (documentElement: HTMLElement, filename: string) => {
  const blob = await buildCheckoutOrderExportPdfBlob(documentElement);
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
};

export { buildCheckoutOrderExportPdfBlob, downloadCheckoutOrderExportPdf };
