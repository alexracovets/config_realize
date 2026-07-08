'use client';

import { useEffect, useState } from 'react';

import type { orderCuttingExportDownloadFileType } from '@types';
import { composeGarmentColorUvAtlas } from '@utils/composeGarmentColorUvAtlas';
import { composeDesignUvLayerPreview, composeDesignUvMixPreview } from '@utils/composeDesignUvPreview';
import { composeTextUvLayer } from '@utils/composeTextUvLayer';
import { openOrderCuttingExportDownloadTarget, resolveOrderCuttingExportDownloadHref } from '@utils/resolveOrderCuttingExportDownloadHref';
import { AtomImage } from '@atoms';

const DOWNLOAD_PREVIEW_SIZE_PX = 60;

type orderCuttingExportDownloadCardPropsType = {
  file: orderCuttingExportDownloadFileType;
};

const OrderCuttingExportDownloadCard = ({ file }: orderCuttingExportDownloadCardPropsType) => {
  const [composedUrl, setComposedUrl] = useState<string | null>(file.previewSrc ?? (file.downloadUrl || null));
  const [isLoading, setIsLoading] = useState(Boolean(file.composeKind));

  useEffect(() => {
    if (!file.composeKind) {
      setComposedUrl(file.previewSrc ?? file.downloadUrl);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    let objectUrl: string | null = null;

    const composePreview = async () => {
      setIsLoading(true);
      setComposedUrl(null);

      try {
        if (file.composeKind === 'design-layer' && file.maskSrc && file.color) {
          objectUrl = await composeDesignUvLayerPreview(file.maskSrc, file.color, file.opacity ?? 1);
        } else if (file.composeKind === 'design-mix' && file.layers?.length) {
          objectUrl = await composeDesignUvMixPreview(file.layers, file.opacity ?? 1);
        } else if (
          (file.composeKind === 'color-atlas' || file.composeKind === 'gradient-atlas') &&
          file.modelSrc &&
          file.colorParts?.length &&
          file.atlasWidth &&
          file.atlasHeight
        ) {
          objectUrl = await composeGarmentColorUvAtlas(file.modelSrc, file.atlasWidth, file.atlasHeight, file.colorParts);
        } else if (file.composeKind === 'text-layer' && file.textLayers?.length && file.atlasWidth && file.atlasHeight) {
          objectUrl = await composeTextUvLayer(file.atlasWidth, file.atlasHeight, file.textLayers);
        }

        if (isCancelled) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          return;
        }

        if (objectUrl) {
          setComposedUrl(objectUrl);
        }
      } catch {
        if (!isCancelled) {
          setComposedUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void composePreview();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    file.atlasHeight,
    file.atlasWidth,
    file.color,
    file.colorParts,
    file.composeKind,
    file.downloadUrl,
    file.layers,
    file.maskSrc,
    file.modelSrc,
    file.opacity,
    file.previewSrc,
    file.textLayers,
  ]);

  const href = resolveOrderCuttingExportDownloadHref(file, composedUrl);

  return (
    <a
      className={`cutting-export__download-card${isLoading ? ' cutting-export__download-card--disabled' : ''}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={isLoading}
      onClick={(event) => {
        event.preventDefault();
        openOrderCuttingExportDownloadTarget(href, isLoading);
      }}
    >
      <div className="cutting-export__download-preview-frame">
        {isLoading ? <span className="cutting-export__download-loading">Composizione UV…</span> : null}
        {!isLoading && composedUrl ? (
          <AtomImage
            src={composedUrl}
            alt={file.label}
            className="cutting-export__download-preview"
            fit="cover"
            width={DOWNLOAD_PREVIEW_SIZE_PX}
            height={DOWNLOAD_PREVIEW_SIZE_PX}
          />
        ) : null}
        {!isLoading && !composedUrl ? <span className="cutting-export__download-placeholder">{file.label}</span> : null}
      </div>
      <span className="cutting-export__download-label">{file.label}</span>
      <span className="cutting-export__download-file">{file.fileName}</span>
    </a>
  );
};

export { OrderCuttingExportDownloadCard };
