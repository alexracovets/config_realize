'use client';

import { useCallback } from 'react';

import { SHARE_CONFIG_EXPORT_FILENAME_PREFIX, SHARE_CONFIG_QUERY_PARAM, SHARE_CONFIG_ROUTE_BASE } from '@constants';
import { captureGarmentConfiguration, useConfigurationCart, useShareDialog } from '@store';
import { buildShareConfigExport, buildStorefrontProductPath, randomId, resolveStorefrontOrigin, uploadCheckoutAssetsDirect } from '@utils';

const createShareId = (): string => randomId();

const buildShareUrl = (shareId: string, slug: string): string => {
  const storefrontOrigin = resolveStorefrontOrigin();

  if (storefrontOrigin && slug) {
    return `${storefrontOrigin}${buildStorefrontProductPath(slug)}?${SHARE_CONFIG_QUERY_PARAM}=${encodeURIComponent(shareId)}`;
  }

  return `${window.location.origin}${SHARE_CONFIG_ROUTE_BASE}/${shareId}`;
};

const useShareConfiguration = () => {
  const openPending = useShareDialog((state) => state.openPending);
  const resolveShareUrl = useShareDialog((state) => state.resolveShareUrl);
  const failShare = useShareDialog((state) => state.failShare);

  const shareConfiguration = useCallback(async () => {
    const { items, activeItemId } = useConfigurationCart.getState();
    const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];

    if (!activeItem) {
      openPending();
      failShare();
      return;
    }

    openPending();

    try {
      const shareExport = buildShareConfigExport({
        collectionHandle: activeItem.collectionHandle,
        slug: activeItem.slug,
        modelId: activeItem.modelId,
        business: activeItem.business,
        configuration: captureGarmentConfiguration(),
      });

      const shareId = createShareId();

      const urlById = await uploadCheckoutAssetsDirect([
        {
          id: 'share-config',
          blob: new Blob([JSON.stringify(shareExport)], { type: 'application/json' }),
          filename: `${SHARE_CONFIG_EXPORT_FILENAME_PREFIX}-${shareId}.json`,
          mimeType: 'application/json',
        },
      ]);

      if (!urlById.get('share-config')) {
        throw new Error('Share configuration upload returned no URL.');
      }

      resolveShareUrl(buildShareUrl(shareId, activeItem.slug));
    } catch (error) {
      console.error('[share] Failed to share configuration.', error);
      failShare();
    }
  }, [openPending, resolveShareUrl, failShare]);

  return { shareConfiguration };
};

export { useShareConfiguration };
