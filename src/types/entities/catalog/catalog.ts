import type { garmentBusinessType, modelIdType } from '@types';

interface configuratorCatalogProductPickType {
  collectionHandle: string;
  slug: string;
  modelId: modelIdType;
  business?: garmentBusinessType;
}

export type { configuratorCatalogProductPickType };
