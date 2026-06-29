'use client';

import { useConfiguratorRouteReset } from '@hooks/useConfiguratorRouteReset';
import { useEmbeddedActiveProductSync } from '@hooks/useEmbeddedActiveProductSync';
import { useEmbeddedLoaderSync } from '@hooks/useEmbeddedLoaderSync';
import { useEmbeddedUrlSync } from '@hooks/useEmbeddedUrlSync';

const EmbeddedUrlSyncBridge = () => {
  useConfiguratorRouteReset();
  useEmbeddedUrlSync();
  useEmbeddedActiveProductSync();
  useEmbeddedLoaderSync();

  return null;
};

export { EmbeddedUrlSyncBridge };
