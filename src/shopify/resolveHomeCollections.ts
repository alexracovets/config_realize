import { HOME_PRODUCT_GALLERY_BLOCKS } from '@constants';
import type { homePageCollectionType } from '@types';

import { isShopifyEnabled } from './config';
import { fetchConfiguratorCollections } from './fetchConfiguratorCollections';

const resolveLocalHomeCollections = (): homePageCollectionType[] =>
  HOME_PRODUCT_GALLERY_BLOCKS.map(({ id, title, items }) => ({
    id,
    title,
    handle: id,
    products: items.map(({ collection, slug, alt }) => ({
      id: `${collection}-${slug}`,
      title: alt,
      handle: slug,
      status: 'ACTIVE',
      modelId: null,
      price: null,
      currencyCode: null,
      previewSrc: null,
      activePreviewSrc: null,
    })),
  }));

const resolveHomeCollections = async (): Promise<homePageCollectionType[]> => {
  if (isShopifyEnabled()) {
    try {
      const collections = await fetchConfiguratorCollections();

      if (collections.length > 0) {
        return collections;
      }

      console.warn('[shopify] No configurator collections returned; falling back to local catalog.');
    } catch (error) {
      console.warn('[shopify] Failed to fetch collections; falling back to local catalog.', error);
    }
  }

  return resolveLocalHomeCollections();
};

export { resolveHomeCollections, resolveLocalHomeCollections };
