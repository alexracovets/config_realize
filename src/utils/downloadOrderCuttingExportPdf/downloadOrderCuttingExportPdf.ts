'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import type { cuttingExportDownloadUrlEntryType } from '@utils/applyCuttingExportDownloadUrls';
import { applyCuttingExportDownloadUrls } from '@utils/applyCuttingExportDownloadUrls';

import {
  ORDER_EXPORT_PAGE_HEIGHT_PX,
  ORDER_EXPORT_PAGE_WIDTH_PX,
  paginateOrderCuttingExportDocument,
} from './paginateOrderCuttingExportDocument';

type buildOrderCuttingExportPdfBlobOptionsType = {
  downloadUrls?: cuttingExportDownloadUrlEntryType[];
};

const ORDER_CUTTING_EXPORT_PDF_WIDTH_MM = 210;
const ORDER_CUTTING_EXPORT_PDF_HEIGHT_MM = 297;
const ORDER_CUTTING_EXPORT_PDF_MARGIN_MM = 12;
const ORDER_CUTTING_EXPORT_PAGE_NUMBER_FONT_SIZE = 10;
const ORDER_CUTTING_EXPORT_CAPTURE_SCALE = 1;
const ORDER_CUTTING_EXPORT_JPEG_QUALITY = 0.6;
const ORDER_CUTTING_EXPORT_CAPTURE_TIMEOUT_MS = 45_000;
const ORDER_CUTTING_EXPORT_IMAGE_WAIT_MS = 3_000;

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

const waitForDocumentImages = (root: HTMLElement) =>
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
        ORDER_CUTTING_EXPORT_IMAGE_WAIT_MS,
        'Image load',
      ).catch(() => undefined),
    ),
  );

const addPdfPageNumbers = (pdf: jsPDF) => {
  const totalPages = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(ORDER_CUTTING_EXPORT_PAGE_NUMBER_FONT_SIZE);
    pdf.setTextColor(129, 129, 129);
    pdf.text(`${page} / ${totalPages}`, pageWidth - ORDER_CUTTING_EXPORT_PDF_MARGIN_MM, pageHeight - 6, { align: 'right' });
  }
};

const captureHtmlElement = (element: HTMLElement, height: number) =>
  withTimeout(
    html2canvas(element, {
      scale: ORDER_CUTTING_EXPORT_CAPTURE_SCALE,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: ORDER_EXPORT_PAGE_WIDTH_PX,
      height,
      windowWidth: ORDER_EXPORT_PAGE_WIDTH_PX,
      windowHeight: height,
    }),
    ORDER_CUTTING_EXPORT_CAPTURE_TIMEOUT_MS,
    'PDF capture',
  );

const encodePdfPageCanvas = (canvas: HTMLCanvasElement) => canvas.toDataURL('image/jpeg', ORDER_CUTTING_EXPORT_JPEG_QUALITY);

const appendCanvasToPdf = (pdf: jsPDF, canvas: HTMLCanvasElement, pageIndex: number) => {
  if (pageIndex > 0) {
    pdf.addPage();
  }

  pdf.addImage(
    encodePdfPageCanvas(canvas),
    'JPEG',
    0,
    0,
    ORDER_CUTTING_EXPORT_PDF_WIDTH_MM,
    ORDER_CUTTING_EXPORT_PDF_HEIGHT_MM,
    undefined,
    'FAST',
  );

  canvas.width = 0;
  canvas.height = 0;
};

const resolvePdfLinkUrl = (anchor: HTMLAnchorElement): string | null => {
  const href = anchor.getAttribute('href')?.trim();
  if (!href || href === 'about:blank' || href === '#') return null;
  if (/^(?:https?:|data:)/i.test(href)) return href;
  return null;
};

const addPdfPageLinks = (pdf: jsPDF, pageElement: HTMLElement, pageIndex: number, pageHeightPx: number) => {
  const pageRect = pageElement.getBoundingClientRect();

  pageElement.querySelectorAll('a.cutting-export__download-card').forEach((anchor) => {
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const url = resolvePdfLinkUrl(anchor);
    if (!url) return;

    const rect = anchor.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = ((rect.left - pageRect.left) / ORDER_EXPORT_PAGE_WIDTH_PX) * ORDER_CUTTING_EXPORT_PDF_WIDTH_MM;
    const y = ((rect.top - pageRect.top) / pageHeightPx) * ORDER_CUTTING_EXPORT_PDF_HEIGHT_MM;
    const width = (rect.width / ORDER_EXPORT_PAGE_WIDTH_PX) * ORDER_CUTTING_EXPORT_PDF_WIDTH_MM;
    const height = (rect.height / pageHeightPx) * ORDER_CUTTING_EXPORT_PDF_HEIGHT_MM;

    pdf.setPage(pageIndex + 1);
    pdf.link(x, y, width, height, { url });
  });
};

const getCapturePages = (captureRoot: HTMLElement) => {
  if (captureRoot.classList.contains('cutting-export-pages')) {
    return Array.from(captureRoot.querySelectorAll('.cutting-export-page')).filter(
      (page): page is HTMLElement => page instanceof HTMLElement,
    );
  }

  return [captureRoot];
};

const buildOrderCuttingExportPdfBlob = async (
  documentElement: HTMLElement,
  options: buildOrderCuttingExportPdfBlobOptionsType = {},
): Promise<Blob> => {
  await waitForDocumentImages(documentElement);

  const captureRoot = paginateOrderCuttingExportDocument(documentElement);
  const mountParent = documentElement.parentElement ?? document.body;

  if (captureRoot !== documentElement) {
    documentElement.setAttribute('hidden', '');
    mountParent.appendChild(captureRoot);
  }

  if (options.downloadUrls?.length) {
    applyCuttingExportDownloadUrls(captureRoot, options.downloadUrls);
  }

  const pages = getCapturePages(captureRoot);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  try {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const pageHeight =
        pages.length === 1 && captureRoot === documentElement ? documentElement.scrollHeight : ORDER_EXPORT_PAGE_HEIGHT_PX;
      const canvas = await captureHtmlElement(pages[pageIndex], pageHeight);
      appendCanvasToPdf(pdf, canvas, pageIndex);
      addPdfPageLinks(pdf, pages[pageIndex], pageIndex, pageHeight);
    }

    addPdfPageNumbers(pdf);
    return pdf.output('blob');
  } finally {
    if (captureRoot !== documentElement) {
      captureRoot.remove();
      documentElement.removeAttribute('hidden');
    }
  }
};

const downloadOrderCuttingExportPdf = async (
  documentElement: HTMLElement,
  filename: string,
  options: buildOrderCuttingExportPdfBlobOptionsType = {},
) => {
  const blob = await buildOrderCuttingExportPdfBlob(documentElement, options);
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
};

export { buildOrderCuttingExportPdfBlob, downloadOrderCuttingExportPdf };
export type { buildOrderCuttingExportPdfBlobOptionsType };
