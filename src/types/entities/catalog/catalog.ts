import type { garmentBusinessType, modelIdType } from '@types';

interface configuratorCatalogProductPickType {
  collectionHandle: string;
  slug: string;
  modelId: modelIdType;
  business?: garmentBusinessType;
  /** Shopify catalog image (featured / view_image) shown in the add-product design modal. */
  catalogPreviewSrc?: string | null;
}

export type { configuratorCatalogProductPickType };
