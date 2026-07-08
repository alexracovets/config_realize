'use client';

import type { cuttingExportDownloadUrlEntryType } from '@utils/applyCuttingExportDownloadUrls';
import { applyCuttingExportDownloadUrls } from '@utils/applyCuttingExportDownloadUrls';
import {
  addExportPdfPageNumbers,
  appendCanvasToExportPdf,
  captureExportPageCanvas,
  createExportPdf,
  EXPORT_PDF_PAGE_HEIGHT_MM,
  EXPORT_PDF_PAGE_WIDTH_MM,
  triggerExportPdfDownload,
  waitForExportImages,
} from '@utils/exportPdfCapture';
import type { jsPDF } from 'jspdf';

import {
  ORDER_EXPORT_PAGE_HEIGHT_PX,
  ORDER_EXPORT_PAGE_WIDTH_PX,
  paginateOrderCuttingExportDocument,
} from './paginateOrderCuttingExportDocument';

type buildOrderCuttingExportPdfBlobOptionsType = {
  downloadUrls?: cuttingExportDownloadUrlEntryType[];
};

const ORDER_CUTTING_EXPORT_JPEG_QUALITY = 0.6;

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

    const x = ((rect.left - pageRect.left) / ORDER_EXPORT_PAGE_WIDTH_PX) * EXPORT_PDF_PAGE_WIDTH_MM;
    const y = ((rect.top - pageRect.top) / pageHeightPx) * EXPORT_PDF_PAGE_HEIGHT_MM;
    const width = (rect.width / ORDER_EXPORT_PAGE_WIDTH_PX) * EXPORT_PDF_PAGE_WIDTH_MM;
    const height = (rect.height / pageHeightPx) * EXPORT_PDF_PAGE_HEIGHT_MM;

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
  await waitForExportImages(documentElement);

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
  const pdf = createExportPdf();

  try {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const pageHeight =
        pages.length === 1 && captureRoot === documentElement ? documentElement.scrollHeight : ORDER_EXPORT_PAGE_HEIGHT_PX;
      const canvas = await captureExportPageCanvas(pages[pageIndex], {
        width: ORDER_EXPORT_PAGE_WIDTH_PX,
        height: pageHeight,
      });
      appendCanvasToExportPdf(pdf, canvas, pageIndex, ORDER_CUTTING_EXPORT_JPEG_QUALITY);
      addPdfPageLinks(pdf, pages[pageIndex], pageIndex, pageHeight);
    }

    addExportPdfPageNumbers(pdf);
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
  triggerExportPdfDownload(blob, filename);
};

export { buildOrderCuttingExportPdfBlob, downloadOrderCuttingExportPdf };
export type { buildOrderCuttingExportPdfBlobOptionsType };
