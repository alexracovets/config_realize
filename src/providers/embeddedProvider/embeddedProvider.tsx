'use client';

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useMemo } from 'react';

import type { embeddedContextType, embeddedProviderPropsType } from '@types';

const EmbeddedContext = createContext<embeddedContextType>({
  embedded: false,
  shop: null,
});

const useEmbedded = (): embeddedContextType => useContext(EmbeddedContext);

const EmbeddedProvider = ({ children }: embeddedProviderPropsType) => {
  const searchParams = useSearchParams();

  const value = useMemo(
    () => ({
      embedded: searchParams.get('embedded') === '1',
      shop: searchParams.get('shop'),
    }),
    [searchParams],
  );

  return <EmbeddedContext.Provider value={value}>{children}</EmbeddedContext.Provider>;
};

export { EmbeddedProvider, useEmbedded };
