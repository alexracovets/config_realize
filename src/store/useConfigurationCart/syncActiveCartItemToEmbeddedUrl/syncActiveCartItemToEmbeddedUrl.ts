'use client';

import type { cartItemType } from '@types';
import { buildConfiguratorPath } from '@utils';
import { postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

interface EmbeddedUrlSyncState {
  items: cartItemType[];
  activeItemId: string;
}

const replaceActiveProductUrl = (pathname: string): void => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === pathname) return;

  const { search, hash } = window.location;

  window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`);
};

const syncActiveCartItemToEmbeddedUrl = (subscribe: (listener: (state: EmbeddedUrlSyncState) => void) => void): void => {
  let lastSyncedActiveProductPath: string | null = null;

  subscribe((state) => {
    const activeItem = state.items.find((item) => item.id === state.activeItemId);
    if (!activeItem || !activeItem.collectionHandle || !activeItem.slug) return;

    const pathname = buildConfiguratorPath(activeItem.collectionHandle, activeItem.slug);
    if (lastSyncedActiveProductPath === pathname) return;

    lastSyncedActiveProductPath = pathname;

    replaceActiveProductUrl(pathname);
    postEmbeddedUrlToParent(pathname);
  });
};

export { syncActiveCartItemToEmbeddedUrl };
