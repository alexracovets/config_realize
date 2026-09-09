'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useEmbedded } from '@providers';
import { buildAppPath, isInternalAppPath } from '@utils';
import { EMBEDDED_URL_SYNC_SOURCE_SHOPIFY, isEmbeddedUrlSyncMessage, postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

const isTrustedShopOrigin = (origin: string, shop: string | null, shopOrigin: string | null): boolean => {
  if (shopOrigin && origin === shopOrigin) {
    return true;
  }

  if (shop && (origin === `https://${shop}` || origin === `http://${shop}`)) {
    return true;
  }

  return !shop && !shopOrigin;
};

const useEmbeddedUrlSync = (): void => {
  const { embedded, shop, shopOrigin } = useEmbedded();
  const pathname = usePathname();
  const router = useRouter();
  const lastPostedRef = useRef<string | null>(null);
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!embedded) {
      return;
    }

    if (lastAppliedRef.current === pathname) {
      lastAppliedRef.current = null;
      return;
    }

    if (lastPostedRef.current === pathname) {
      return;
    }

    if (isInternalAppPath(pathname)) {
      return;
    }

    lastPostedRef.current = pathname;
    postEmbeddedUrlToParent(pathname);
  }, [embedded, pathname]);

  useEffect(() => {
    if (!embedded) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (!isEmbeddedUrlSyncMessage(event.data)) {
        return;
      }

      if (event.data.source !== EMBEDDED_URL_SYNC_SOURCE_SHOPIFY) {
        return;
      }

      if (!isTrustedShopOrigin(event.origin, shop, shopOrigin)) {
        return;
      }

      const nextPath = event.data.pathname;

      const currentPath = typeof window === 'undefined' ? pathname : window.location.pathname;

      if (nextPath === currentPath) {
        return;
      }

      lastAppliedRef.current = nextPath;
      router.replace(buildAppPath(nextPath));
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [embedded, pathname, router, shop, shopOrigin]);
};

export { useEmbeddedUrlSync };
