'use client';

import { createContext, useContext, useMemo } from 'react';

import type { pbrMapsType } from '@types';

const PbrMapsContext = createContext<pbrMapsType | null>(null);

const PbrMapsProvider = ({ maps, children }: { maps: pbrMapsType | null; children: React.ReactNode }) => {
  const value = useMemo(() => maps, [maps]);
  return <PbrMapsContext.Provider value={value}>{children}</PbrMapsContext.Provider>;
};

const usePbrMaps = (): pbrMapsType | null => useContext(PbrMapsContext);

export { PbrMapsProvider, usePbrMaps };
