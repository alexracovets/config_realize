'use client';

import { useEmbeddedUrlSync } from '@hooks/useEmbeddedUrlSync';

const EmbeddedUrlSyncBridge = () => {
  useEmbeddedUrlSync();

  return null;
};

export { EmbeddedUrlSyncBridge };
