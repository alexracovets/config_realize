import { isShopifyEnabled } from '@shopify/config';
import { fetchConfiguratorCollections } from '@shopify/fetchConfiguratorCollections';
import { formatShopifyRequestError } from '@shopify/fetchShopifyWithTimeout';
import type { homePageCollectionType } from '@types';

const resolveHomeCollections = async (): Promise<homePageCollectionType[]> => {
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
    console.warn(`[shopify] Failed to fetch collections (${formatShopifyRequestError(error)}).`);
  }

  return [];
};

export { resolveHomeCollections };
