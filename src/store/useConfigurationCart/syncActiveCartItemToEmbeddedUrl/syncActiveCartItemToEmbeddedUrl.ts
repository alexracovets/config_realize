'use client';

import type { cartItemType } from '@types';
import { buildConfiguratorPath } from '@utils';
import { postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

interface EmbeddedUrlSyncState {
  items: cartItemType[];
  activeItemId: string;
}

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
