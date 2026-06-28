import { cache } from 'react';

import { isShopifyEnabled } from '@shopify/config';
import { fetchConfiguratorCollections } from '@shopify/fetchConfiguratorCollections';
import type { homePageCollectionType } from '@types';

const resolveHomeCollections = cache(async (): Promise<homePageCollectionType[]> => {
  if (!isShopifyEnabled()) {
    console.warn('[shopify] Shopify is disabled; no home collections available.');
    return [];
  }

  try {
    const collections = await fetchConfiguratorCollections();

    if (collections.length > 0) {
      return collections;
    }

    console.warn('[shopify] No configurator collections returned.');
  } catch (error) {
    console.warn('[shopify] Failed to fetch collections.', error);
  }

  return [];
});

export { resolveHomeCollections };
