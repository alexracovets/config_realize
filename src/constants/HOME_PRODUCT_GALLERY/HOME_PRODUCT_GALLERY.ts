import type { homeProductGalleryBlockType } from '@types';
import { CATALOG_PRODUCT_ENTRIES, PRODUCT_COLLECTIONS } from '../PRODUCT_CATALOG';

const HOME_PRODUCT_GALLERY_BLOCKS: homeProductGalleryBlockType[] = PRODUCT_COLLECTIONS.map((collection) => ({
  id: `home-${collection.id}`,
  title: collection.galleryTitle,
  items: CATALOG_PRODUCT_ENTRIES.filter((entry) => entry.collection === collection.id).map((entry) => ({
    collection: entry.collection,
    slug: entry.slug,
    alt: entry.name,
  })),
}));

export { HOME_PRODUCT_GALLERY_BLOCKS };
