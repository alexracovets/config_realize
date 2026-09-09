import { isShopifyEnabled } from '@shopify/config';
import { fetchCollectionByHandle } from '@shopify/fetchConfiguratorCollections';
import { formatShopifyRequestError } from '@shopify/fetchShopifyWithTimeout';
import type { homePageCollectionType } from '@types';

const resolveHomeCollectionByHandle = async (handle: string): Promise<homePageCollectionType | null> => {
  if (!isShopifyEnabled()) {
    console.warn('[shopify] Shopify is disabled; collection unavailable.');
    return null;
  }

  try {
    return await fetchCollectionByHandle(handle);
  } catch (error) {
    console.warn(`[shopify] Failed to fetch collection "${handle}" (${formatShopifyRequestError(error)}).`);
    return null;
  }
};

export { resolveHomeCollectionByHandle };
