import { cache } from 'react';

import { isShopifyEnabled } from '@shopify/config';
import { fetchConfiguratorCollectionSummaries } from '@shopify/fetchConfiguratorCollections';
import type { homePageCollectionSummaryType } from '@types';

const resolveHomeCollectionSummaries = cache(async (): Promise<homePageCollectionSummaryType[]> => {
  if (!isShopifyEnabled()) {
    console.warn('[shopify] Shopify is disabled; no home collections available.');
    return [];
  }

  try {
    const collections = await fetchConfiguratorCollectionSummaries();

    if (collections.length > 0) {
      return collections;
    }

    console.warn('[shopify] No configurator collection summaries returned.');
  } catch (error) {
    console.warn('[shopify] Failed to fetch collection summaries.', error);
  }

  return [];
});

export { resolveHomeCollectionSummaries };
