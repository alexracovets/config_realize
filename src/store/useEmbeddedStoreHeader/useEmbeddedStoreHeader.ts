'use client';

import type { storeHeaderData } from '@utils/embeddedUrlSync';

import { createSingletonStore } from '@store/createSingletonStore';

interface EmbeddedStoreHeaderState {
  data: storeHeaderData | null;
  setData: (data: storeHeaderData) => void;
}

// Holds the storefront header data (menu, socials, announcements, language, cart
// count) that the host page forwards once, so the embedded header inside the
// configurator iframe can render 1:1 with the real Shopify header.
const useEmbeddedStoreHeader = createSingletonStore<EmbeddedStoreHeaderState>('useEmbeddedStoreHeader', (set) => ({
  data: null,
  setData: (data: storeHeaderData) => set({ data }),
}));

export { useEmbeddedStoreHeader };
