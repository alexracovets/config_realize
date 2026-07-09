import { cache } from 'react';

import { CONFIGURATOR_DEFAULT_MINIMUM_COUNT, resolveShopifyCollectionVolumeDiscount } from '@constants';
import { isShopifyEnabled } from '@shopify/config';
import { fetchConfiguratorProductByHandle } from '@shopify/fetchConfiguratorProductByHandle';
import type { configuratorProductHydrationType } from '@configurator/types';
import type { garmentBusinessType } from '@types';
import { resolveConfiguratorProductBySlug } from '@utils';

const mergeCollectionVolumeTerms = (business: garmentBusinessType, collectionHandle: string): garmentBusinessType => {
  const terms = resolveShopifyCollectionVolumeDiscount(collectionHandle);
  if (!terms) return business;

  return {
    ...business,
    minimumCount: business.minimumCount > 0 ? business.minimumCount : terms.minimumOrderCount,
    bonusCount: business.bonusCount > 0 ? business.bonusCount : terms.bonusCount,
    bonusDiscount: business.bonusDiscount > 0 ? business.bonusDiscount : terms.bonusDiscount,
  };
};

const withDefaultMinimumOrder = (product: configuratorProductHydrationType): configuratorProductHydrationType => {
  if (product.business.minimumCount > 0) return product;

  return {
    ...product,
    business: {
      ...product.business,
      minimumCount: CONFIGURATOR_DEFAULT_MINIMUM_COUNT,
    },
  };
};

const resolveConfiguratorProduct = cache(async (slug: string, collectionHandle?: string): Promise<configuratorProductHydrationType | null> => {
  const localProduct = resolveConfiguratorProductBySlug(slug);

  if (!isShopifyEnabled()) {
    return localProduct;
  }

  try {
    const shopifyProduct = await fetchConfiguratorProductByHandle(slug);
    let product = shopifyProduct ?? localProduct;

    if (!product) {
      console.warn(`[shopify] Product "${slug}" not found by handle or custom.id; falling back to local catalog.`);
      return localProduct;
    }

    if (collectionHandle?.trim()) {
      product = {
        ...product,
        business: mergeCollectionVolumeTerms(product.business, collectionHandle),
      };
    }

    return withDefaultMinimumOrder(product);
  } catch (error) {
    console.warn(`[shopify] Failed to fetch product "${slug}"; falling back to local catalog.`, error);
  }

  return localProduct;
});

export { resolveConfiguratorProduct };
