'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type { embeddedContextType, embeddedProviderPropsType } from '@types';
import { resolveEmbeddedContext } from '@utils';

const EmbeddedContext = createContext<embeddedContextType>({
  embedded: false,
  shop: null,
});

const EMBEDDED_DEFAULT: embeddedContextType = { embedded: false, shop: null };

let cachedEmbeddedSnapshot: embeddedContextType = EMBEDDED_DEFAULT;

const getEmbeddedContextSnapshot = (): embeddedContextType => {
  const next = resolveEmbeddedContext();

  if (cachedEmbeddedSnapshot.embedded === next.embedded && cachedEmbeddedSnapshot.shop === next.shop) {
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

  return <EmbeddedContext.Provider value={value}>{children}</EmbeddedContext.Provider>;
};

export { EmbeddedProvider, useEmbedded };
