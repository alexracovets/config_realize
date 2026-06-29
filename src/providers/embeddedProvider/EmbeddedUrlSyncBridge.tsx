'use client';

import { useEmbeddedActiveProductSync } from '@hooks/useEmbeddedActiveProductSync';
import { useEmbeddedUrlSync } from '@hooks/useEmbeddedUrlSync';

const EmbeddedUrlSyncBridge = () => {
  useEmbeddedUrlSync();
  useEmbeddedActiveProductSync();

  return null;
};

export { EmbeddedUrlSyncBridge };
