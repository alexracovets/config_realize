'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type { embeddedContextType, embeddedProviderPropsType } from '@types';

const EmbeddedContext = createContext<embeddedContextType>({
  embedded: false,
  shop: null,
});

const EMBEDDED_DEFAULT: embeddedContextType = { embedded: false, shop: null };

let cachedEmbeddedSnapshot: embeddedContextType = EMBEDDED_DEFAULT;

const getEmbeddedContextSnapshot = (): embeddedContextType => {
  const params = new URLSearchParams(window.location.search);
  const embedded = params.get('embedded') === '1';
  const shop = params.get('shop');

  if (cachedEmbeddedSnapshot.embedded === embedded && cachedEmbeddedSnapshot.shop === shop) {
    return cachedEmbeddedSnapshot;
  }

  cachedEmbeddedSnapshot = { embedded, shop };
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

  return <EmbeddedContext.Provider value={value}>{children}</EmbeddedContext.Provider>;
};

export { EmbeddedProvider, useEmbedded };
