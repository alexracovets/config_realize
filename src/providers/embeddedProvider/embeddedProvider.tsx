'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type { embeddedContextType, embeddedProviderPropsType } from '@types';
import { resolveEmbeddedContext } from '@utils';

import { ConfiguratorRouteResetBridge } from '@providers/embeddedProvider/ConfiguratorRouteResetBridge';
import { EmbeddedFlagBridge } from '@providers/embeddedProvider/EmbeddedFlagBridge';
import { EmbeddedHeaderHeightBridge } from '@providers/embeddedProvider/EmbeddedHeaderHeightBridge';
import { EmbeddedStoreHeaderBridge } from '@providers/embeddedProvider/EmbeddedStoreHeaderBridge';
import { EmbeddedUrlSyncBridge } from '@providers/embeddedProvider/EmbeddedUrlSyncBridge';
import { EmbeddedViewportKickBridge } from '@providers/embeddedProvider/EmbeddedViewportKickBridge';

const EMBEDDED_DEFAULT: embeddedContextType = { embedded: false, shop: null, host: null, shopOrigin: null };

const EmbeddedContext = createContext<embeddedContextType>(EMBEDDED_DEFAULT);

let cachedEmbeddedSnapshot: embeddedContextType = EMBEDDED_DEFAULT;

const getEmbeddedContextSnapshot = (): embeddedContextType => {
  const next = resolveEmbeddedContext();

  if (
    cachedEmbeddedSnapshot.embedded === next.embedded &&
    cachedEmbeddedSnapshot.shop === next.shop &&
    cachedEmbeddedSnapshot.host === next.host &&
    cachedEmbeddedSnapshot.shopOrigin === next.shopOrigin
  ) {
    return cachedEmbeddedSnapshot;
  }

  cachedEmbeddedSnapshot = next;
  return cachedEmbeddedSnapshot;
};

const subscribeToEmbeddedSearchParams = (onStoreChange: () => void) => {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
};

const useEmbeddedSearchParams = (): embeddedContextType =>
  useSyncExternalStore(subscribeToEmbeddedSearchParams, getEmbeddedContextSnapshot, () => EMBEDDED_DEFAULT);

const useEmbedded = (): embeddedContextType => useContext(EmbeddedContext);

const EmbeddedProvider = ({ children }: embeddedProviderPropsType) => {
  const value = useEmbeddedSearchParams();

  return (
    <EmbeddedContext.Provider value={value}>
      <EmbeddedUrlSyncBridge />
      <EmbeddedFlagBridge />
      <EmbeddedHeaderHeightBridge />
      <EmbeddedStoreHeaderBridge />
      <EmbeddedViewportKickBridge />
      <ConfiguratorRouteResetBridge />
      {children}
    </EmbeddedContext.Provider>
  );
};

export { EmbeddedProvider, useEmbedded };
