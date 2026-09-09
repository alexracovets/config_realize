'use client';

import { useEffect } from 'react';

import { isEmbeddedSession } from '@utils';
import { isEmbeddedHeaderHeightMessage } from '@utils/embeddedUrlSync';

const EmbeddedHeaderHeightBridge = () => {
  useEffect(() => {
    if (!isEmbeddedSession() || window.parent === window) return;

    const onMessage = (event: MessageEvent) => {
      if (!isEmbeddedHeaderHeightMessage(event.data)) return;

      document.documentElement.style.setProperty('--embed-header-offset', `${event.data.height}px`);
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, []);

  return null;
};

export { EmbeddedHeaderHeightBridge };
