'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useEmbedded } from '@providers';
import { useConfigurationCart } from '@store';
import { buildConfiguratorPath, isConfiguratorPath } from '@utils';
import {
  postEmbeddedDocumentMetadataToParent,
  postEmbeddedUrlToParent,
} from '@utils/embeddedUrlSync';

const buildActiveProductSyncKey = (
  collectionHandle: string,
  slug: string,
  productHandle: string,
): string => `${collectionHandle}/${slug}/${productHandle}`;

const useEmbeddedActiveProductSync = (): void => {
  const { embedded } = useEmbedded();
  const pathname = usePathname();
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const activeItem = useConfigurationCart((state) =>
    state.items.find((item) => item.id === state.activeItemId),
  );
  const lastSyncedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!embedded || !activeItem || !isConfiguratorPath(pathname)) {
      return;
    }

    const syncKey = buildActiveProductSyncKey(
      activeItem.collectionHandle,
      activeItem.slug,
      activeItem.business.handle,
    );

    if (lastSyncedKeyRef.current === syncKey) {
      return;
    }

    lastSyncedKeyRef.current = syncKey;

    const syncPathname = activeItem.collectionHandle
      ? buildConfiguratorPath(activeItem.collectionHandle, activeItem.slug)
      : `/${activeItem.slug}`;

    postEmbeddedUrlToParent(syncPathname);
    postEmbeddedDocumentMetadataToParent({
      title: activeItem.business.name,
      url: `/products/${activeItem.business.handle}`,
    });
  }, [
    embedded,
    pathname,
    activeItemId,
    activeItem?.collectionHandle,
    activeItem?.slug,
    activeItem?.business.handle,
    activeItem?.business.name,
  ]);
};

export { useEmbeddedActiveProductSync };
