'use client';

import { useEffect, useRef } from 'react';

import { useEmbedded } from '@providers';
import { useConfigurationCart } from '@store';
import { buildConfiguratorPath } from '@utils';
import { postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

/**
 * Keeps the host (Shopify) URL and SEO metadata in sync with the *active* configurator
 * session item. Switching/adding products only mutates the local cart store (no Next.js
 * route change), so {@link useEmbeddedUrlSync} — which reacts to `pathname` — never fires.
 * This hook bridges that gap by posting a `navigate` message whenever the active item's
 * handle changes; the theme then updates the address bar and refetches product metadata.
 */
const useEmbeddedActiveProductSync = (): void => {
  const { embedded } = useEmbedded();
  const lastPostedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!embedded) {
      return;
    }

    const syncActiveProduct = (): void => {
      const { items, activeItemId } = useConfigurationCart.getState();
      const activeItem = items.find((item) => item.id === activeItemId);

      if (!activeItem || !activeItem.collectionHandle || !activeItem.slug) {
        return;
      }

      const pathname = buildConfiguratorPath(activeItem.collectionHandle, activeItem.slug);

      if (lastPostedRef.current === pathname) {
        return;
      }

      lastPostedRef.current = pathname;
      postEmbeddedUrlToParent(pathname);
    };

    syncActiveProduct();

    return useConfigurationCart.subscribe(syncActiveProduct);
  }, [embedded]);
};

export { useEmbeddedActiveProductSync };
