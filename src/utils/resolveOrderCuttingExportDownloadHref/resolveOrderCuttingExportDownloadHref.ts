import type { orderCuttingExportDownloadFileType } from '@types';

import { ORDER_CUTTING_EXPORT_DOWNLOAD_PLACEHOLDER_HREF } from '@constants';

const resolveOrderCuttingExportDownloadHref = (file: orderCuttingExportDownloadFileType, previewUrl?: string | null) =>
  previewUrl ?? file.downloadUrl ?? file.previewSrc ?? ORDER_CUTTING_EXPORT_DOWNLOAD_PLACEHOLDER_HREF;

const hasOrderCuttingExportDownloadTarget = (file: orderCuttingExportDownloadFileType, previewUrl?: string | null) =>
  Boolean(previewUrl ?? file.downloadUrl ?? file.previewSrc);

const openOrderCuttingExportDownloadTarget = (href: string, isDisabled = false) => {
  if (isDisabled) return;

  const openedWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!openedWindow) return;

  openedWindow.opener = null;
  openedWindow.location.href = href;
};

export { hasOrderCuttingExportDownloadTarget, openOrderCuttingExportDownloadTarget, resolveOrderCuttingExportDownloadHref };
