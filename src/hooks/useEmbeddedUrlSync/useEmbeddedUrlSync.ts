'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useEmbedded } from '@providers';
import { buildAppPath } from '@utils';
import {
  EMBEDDED_URL_SYNC_SOURCE_SHOPIFY,
  isEmbeddedUrlSyncMessage,
  postEmbeddedUrlToParent,
} from '@utils/embeddedUrlSync';

const useEmbeddedUrlSync = (): void => {
  const { embedded, shop } = useEmbedded();
  const pathname = usePathname();
  const router = useRouter();
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!embedded) {
      return;
    }

    if (lastAppliedRef.current === pathname) {
      lastAppliedRef.current = null;
      return;
    }

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
