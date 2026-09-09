'use client';

import { useEffect, useRef } from 'react';

import { SHARE_CONFIG_QUERY_PARAM } from '@constants';
import { applyGarmentConfiguration, useConfigurationCart } from '@store';
import { getModel, parseShareConfigExport } from '@utils';

const stripShareParamFromUrl = (): void => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(SHARE_CONFIG_QUERY_PARAM)) return;

  url.searchParams.delete(SHARE_CONFIG_QUERY_PARAM);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
};

const useRestoreSharedConfiguration = () => {
  const restoredShareIdRef = useRef<string | null>(null);

  useEffect(() => {
    const shareId = new URLSearchParams(window.location.search).get(SHARE_CONFIG_QUERY_PARAM);
    if (!shareId || restoredShareIdRef.current === shareId) return;

    restoredShareIdRef.current = shareId;
    stripShareParamFromUrl();

    let isCancelled = false;

    const restore = async () => {
      try {
        const response = await fetch(`/api/share/${encodeURIComponent(shareId)}`);
        if (!response.ok) {
          throw new Error(`Shared configuration HTTP ${response.status}`);
        }

        const shareExport = parseShareConfigExport(await response.json());
        if (!shareExport || isCancelled) {
          if (!shareExport) console.warn('[share] Shared configuration payload is invalid or unsupported.');
          return;
        }

        const garment = getModel(shareExport.modelId);
        if (!garment) {
          console.warn(`[share] Unknown model "${shareExport.modelId}" in shared configuration.`);
          return;
        }

        const cart = useConfigurationCart.getState();
        const activeItemId = cart.activeItemId;

        cart.setActiveItemProduct({
          collectionHandle: shareExport.collectionHandle,
          slug: shareExport.slug,
          modelId: shareExport.modelId,
          business: shareExport.business,
        });

        // setActiveItemProduct drops the stored configuration on a model switch and kicks off an
        // async activateCartItem that re-applies whatever is stored. Seed the shared configuration
        // right after it so that activation restores this one instead of falling back to defaults.
        useConfigurationCart.getState().saveConfiguration(activeItemId, shareExport.configuration);

        applyGarmentConfiguration(garment, shareExport.configuration);
      } catch (error) {
        console.error('[share] Failed to restore shared configuration.', error);
      }
    };

    void restore();

    return () => {
      isCancelled = true;
    };
  }, []);
};

export { useRestoreSharedConfiguration };
