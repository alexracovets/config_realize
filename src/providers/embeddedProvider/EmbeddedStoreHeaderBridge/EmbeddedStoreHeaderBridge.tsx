'use client';

import { useEffect } from 'react';

import { useEmbeddedStoreHeader } from '@store';
import { isEmbeddedSession } from '@utils';
import { isEmbeddedStoreHeaderMessage } from '@utils/embeddedUrlSync';

// Receives the storefront header data the host page posts once on 'ready' and
// stores it, so the embedded header renders 1:1 with the real Shopify header.
const EmbeddedStoreHeaderBridge = () => {
  useEffect(() => {
    if (!isEmbeddedSession() || window.parent === window) return;

    const onMessage = (event: MessageEvent) => {
      if (!isEmbeddedStoreHeaderMessage(event.data)) return;
      useEmbeddedStoreHeader.getState().setData(event.data.data);
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, []);

  return null;
};

export { EmbeddedStoreHeaderBridge };
