import type { productCollectionIdType } from '@types';

type homeProductGalleryItemType = {
  collection: productCollectionIdType;
  slug: string;
  alt: string;
};

type homeProductGalleryBlockType = {
  id: string;
  title: string;
  items: homeProductGalleryItemType[];
};

export type { homeProductGalleryBlockType, homeProductGalleryItemType };
