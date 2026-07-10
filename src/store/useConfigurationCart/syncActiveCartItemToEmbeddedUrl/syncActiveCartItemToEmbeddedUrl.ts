'use client';

import type { cartItemType } from '@types';
import { buildConfiguratorPath } from '@utils';
import { postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

interface EmbeddedUrlSyncState {
  items: cartItemType[];
  activeItemId: string;
}

/**
 * Mirrors the *active* session item into the host (Shopify) URL + SEO when embedded.
 * Switching/adding products only mutates the cart store (no Next.js route change), so the
 * route-based `useEmbeddedUrlSync` never fires. Posts a `navigate` message instead; the theme
 * updates the address bar and refetches product metadata.
 *
 * Kept as a plain subscriber (not a React hook/provider) — wiring this through a provider pulled
 * the 3D bundle into a second chunk and produced duplicate `@react-three/fiber` instances
 * ("Hooks can only be used within the Canvas component").
 */
const syncActiveCartItemToEmbeddedUrl = (subscribe: (listener: (state: EmbeddedUrlSyncState) => void) => void): void => {
  let lastPostedActiveProductPath: string | null = null;

  subscribe((state) => {
    const activeItem = state.items.find((item) => item.id === state.activeItemId);
    if (!activeItem || !activeItem.collectionHandle || !activeItem.slug) return;

    const pathname = buildConfiguratorPath(activeItem.collectionHandle, activeItem.slug);
    if (lastPostedActiveProductPath === pathname) return;

    lastPostedActiveProductPath = pathname;
    postEmbeddedUrlToParent(pathname);
  });
};

export { syncActiveCartItemToEmbeddedUrl };
