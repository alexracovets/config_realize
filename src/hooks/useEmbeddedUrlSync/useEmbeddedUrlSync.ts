'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useEmbedded } from '@providers';
import { buildAppPath, isInternalAppPath } from '@utils';
import { EMBEDDED_URL_SYNC_SOURCE_SHOPIFY, isEmbeddedUrlSyncMessage, postEmbeddedUrlToParent } from '@utils/embeddedUrlSync';

const useEmbeddedUrlSync = (): void => {
  const { embedded, shop } = useEmbedded();
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

    // In-app-only routes (e.g. the internal checkout/summary view) must not be mirrored
    // to the host URL — the theme would treat `/checkout` as the real Shopify checkout.
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

      if (shop) {
        const expectedOrigin = `https://${shop}`;

        if (event.origin !== expectedOrigin && event.origin !== `http://${shop}`) {
          return;
        }
      }

      const nextPath = event.data.pathname;

      if (nextPath === pathname) {
        return;
      }

      lastAppliedRef.current = nextPath;
      router.replace(buildAppPath(nextPath));
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [embedded, pathname, router, shop]);
};

export { useEmbeddedUrlSync };
