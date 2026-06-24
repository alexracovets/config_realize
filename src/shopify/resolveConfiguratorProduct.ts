import type { configuratorProductHydrationType } from '@types';
import { resolveConfiguratorProductBySlug } from '@utils';

import { isShopifyEnabled } from './config';
import { fetchConfiguratorProductByHandle } from './fetchConfiguratorProductByHandle';

const resolveConfiguratorProduct = async (slug: string): Promise<configuratorProductHydrationType | null> => {
  if (isShopifyEnabled()) {
    try {
      const shopifyProduct = await fetchConfiguratorProductByHandle(slug);

      if (shopifyProduct) {
        return shopifyProduct;
      }

      console.warn(
        `[shopify] Product "${slug}" not found by handle or custom.id; falling back to local catalog.`,
      );
    } catch (error) {
      console.warn(`[shopify] Failed to fetch product "${slug}"; falling back to local catalog.`, error);
    }
  }

  return resolveConfiguratorProductBySlug(slug);
};

export { resolveConfiguratorProduct };
