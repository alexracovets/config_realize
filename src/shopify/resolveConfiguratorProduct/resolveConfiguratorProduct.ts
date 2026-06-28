import { cache } from 'react';

import { isShopifyEnabled } from '@shopify/config';
import { fetchConfiguratorProductByHandle } from '@shopify/fetchConfiguratorProductByHandle';
import type { configuratorProductHydrationType } from '@configurator/types';
import { resolveConfiguratorProductBySlug } from '@utils';

const resolveConfiguratorProduct = cache(async (slug: string): Promise<configuratorProductHydrationType | null> => {
  const localProduct = resolveConfiguratorProductBySlug(slug);

  if (!isShopifyEnabled()) {
    return localProduct;
  }

  try {
    const shopifyProduct = await fetchConfiguratorProductByHandle(slug);

    if (shopifyProduct) {
      return shopifyProduct;
    }

    console.warn(`[shopify] Product "${slug}" not found by handle or custom.id; falling back to local catalog.`);
  } catch (error) {
    console.warn(`[shopify] Failed to fetch product "${slug}"; falling back to local catalog.`, error);
  }

  return localProduct;
});

export { resolveConfiguratorProduct };
