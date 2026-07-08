'use client';

import type { orderCuttingExportDownloadFileType } from '@types';
import { openOrderCuttingExportDownloadTarget, resolveOrderCuttingExportDownloadHref } from '@utils/resolveOrderCuttingExportDownloadHref';
import { AtomImage } from '@atoms';

const DOWNLOAD_PREVIEW_SIZE_PX = 60;

type orderCuttingExportDownloadCardStaticPropsType = {
  file: orderCuttingExportDownloadFileType;
};

const OrderCuttingExportDownloadCardStatic = ({ file }: orderCuttingExportDownloadCardStaticPropsType) => {
  const previewSrc = file.previewSrc ?? file.downloadUrl;
  const href = resolveOrderCuttingExportDownloadHref(file, previewSrc);

  return (
    <a
      className="cutting-export__download-card"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.preventDefault();
        openOrderCuttingExportDownloadTarget(href);
      }}
    >
      <div className="cutting-export__download-preview-frame">
        {previewSrc ? (
          <AtomImage
            src={previewSrc}
            alt={file.label}
            className="cutting-export__download-preview"
            fit="cover"
            width={DOWNLOAD_PREVIEW_SIZE_PX}
            height={DOWNLOAD_PREVIEW_SIZE_PX}
          />
        ) : (
          <span className="cutting-export__download-placeholder">{file.label}</span>
        )}
      </div>
      <span className="cutting-export__download-label">{file.label}</span>
      <span className="cutting-export__download-file">{file.fileName}</span>
    </a>
  );
};

export { OrderCuttingExportDownloadCardStatic };
