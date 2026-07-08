'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const EXPORT_PDF_PAGE_WIDTH_MM = 210;
const EXPORT_PDF_PAGE_HEIGHT_MM = 297;
const EXPORT_PDF_MARGIN_MM = 12;
const EXPORT_PDF_PAGE_NUMBER_FONT_SIZE = 10;
const EXPORT_PDF_CAPTURE_TIMEOUT_MS = 45_000;
const EXPORT_PDF_IMAGE_WAIT_MS = 5_000;
const EXPORT_PDF_DOWNLOAD_URL_REVOKE_DELAY_MS = 10_000;

type exportPdfCaptureOptionsType = {
  width: number;
  height: number;
  scale?: number;
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, label: string) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });

/** Waits for every <img> under the root to settle (load, error, or per-image timeout). */
const waitForExportImages = (root: HTMLElement) =>
  Promise.all(
    Array.from(root.querySelectorAll('img')).map((image) =>
      withTimeout(
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
        EXPORT_PDF_IMAGE_WAIT_MS,
        'Image load',
      ).catch(() => undefined),
    ),
  );

const createExportPdf = () => new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

const captureExportPageCanvas = (element: HTMLElement, { width, height, scale = 1 }: exportPdfCaptureOptionsType) =>
  withTimeout(
    html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    }),
    EXPORT_PDF_CAPTURE_TIMEOUT_MS,
    'PDF capture',
  );

const appendCanvasToExportPdf = (pdf: jsPDF, canvas: HTMLCanvasElement, pageIndex: number, jpegQuality: number) => {
  if (pageIndex > 0) {
    pdf.addPage();
  }

  pdf.addImage(
    canvas.toDataURL('image/jpeg', jpegQuality),
    'JPEG',
    0,
    0,
    EXPORT_PDF_PAGE_WIDTH_MM,
    EXPORT_PDF_PAGE_HEIGHT_MM,
    undefined,
    'FAST',
  );

  // Release canvas memory as soon as the page is encoded.
  canvas.width = 0;
  canvas.height = 0;
};

const addExportPdfPageNumbers = (pdf: jsPDF) => {
  const totalPages = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(EXPORT_PDF_PAGE_NUMBER_FONT_SIZE);
    pdf.setTextColor(129, 129, 129);
    pdf.text(`${page} / ${totalPages}`, pageWidth - EXPORT_PDF_MARGIN_MM, pageHeight - 6, { align: 'right' });
  }
};

const triggerExportPdfDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  // Revoking synchronously can abort the download in Safari/Firefox.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), EXPORT_PDF_DOWNLOAD_URL_REVOKE_DELAY_MS);
};

export {
  EXPORT_PDF_PAGE_HEIGHT_MM,
  EXPORT_PDF_PAGE_WIDTH_MM,
  addExportPdfPageNumbers,
  appendCanvasToExportPdf,
  captureExportPageCanvas,
  createExportPdf,
  triggerExportPdfDownload,
  waitForExportImages,
  withTimeout,
};
export type { exportPdfCaptureOptionsType };
