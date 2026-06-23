import type { garmentConfigType, modelIdType } from '@types';

type productCollectionIdType = 'first' | 'second' | 'third' | 'fourd';

interface catalogProductEntryType {
  collection: productCollectionIdType;
  slug: string;
  name: string;
  modelId?: modelIdType;
  configurable: boolean;
  /** Use 3D garment thumb instead of `/png/products/{collection}/{slug}/{slug}.png`. */
  useGarmentPreview?: boolean;
}

interface productCollectionType {
  id: productCollectionIdType;
  label: string;
  galleryTitle: string;
  coverSrc: string;
}

interface catalogProductRefType {
  collection: productCollectionIdType;
  slug: string;
  name: string;
  modelId: modelIdType;
  configurable: boolean;
  previewSrc: string;
  product: garmentConfigType;
}

export type { catalogProductEntryType, catalogProductRefType, productCollectionIdType, productCollectionType };
