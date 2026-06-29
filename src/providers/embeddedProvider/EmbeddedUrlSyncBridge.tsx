'use client';

import { useEmbeddedActiveProductSync } from '@hooks/useEmbeddedActiveProductSync';
import { useEmbeddedLoaderSync } from '@hooks/useEmbeddedLoaderSync';
import { useEmbeddedUrlSync } from '@hooks/useEmbeddedUrlSync';

const EmbeddedUrlSyncBridge = () => {
  useEmbeddedUrlSync();
  useEmbeddedActiveProductSync();
  useEmbeddedLoaderSync();

  return null;
};

export { EmbeddedUrlSyncBridge };
