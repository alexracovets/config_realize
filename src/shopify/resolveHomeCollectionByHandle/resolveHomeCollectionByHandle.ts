import { cache } from 'react';

import { isShopifyEnabled } from '@shopify/config';
import { fetchCollectionByHandle } from '@shopify/fetchConfiguratorCollections';
import type { homePageCollectionType } from '@types';

const resolveHomeCollectionByHandle = cache(async (handle: string): Promise<homePageCollectionType | null> => {
  if (!isShopifyEnabled()) {
    console.warn('[shopify] Shopify is disabled; collection unavailable.');
    return null;
  }

  try {
    return await fetchCollectionByHandle(handle);
  } catch (error) {
    console.warn(`[shopify] Failed to fetch collection "${handle}".`, error);
    return null;
  }
});

export { resolveHomeCollectionByHandle };
