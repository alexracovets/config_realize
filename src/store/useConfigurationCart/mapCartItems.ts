'use client';

import type { cartItemType, garmentBusinessType, modelIdType, productCollectionIdType } from '@types';
import { DEFAULT_CATALOG_PRODUCT } from '@constants';
import { DEFAULT_MODEL_ID, deriveLocalBusiness } from '@utils';

const DEFAULT_MODEL: modelIdType = DEFAULT_CATALOG_PRODUCT.modelId ?? DEFAULT_MODEL_ID;
const DEFAULT_COLLECTION: productCollectionIdType = DEFAULT_CATALOG_PRODUCT.collection;
const DEFAULT_SLUG = DEFAULT_CATALOG_PRODUCT.slug;

const createCartItem = (params: {
  collection: productCollectionIdType;
  slug: string;
  modelId: modelIdType;
  business?: garmentBusinessType;
}): cartItemType => ({
  id: `cart-${params.collection}-${params.slug}-${crypto.randomUUID()}`,
  collection: params.collection,
  slug: params.slug,
  modelId: params.modelId,
  business: params.business ?? deriveLocalBusiness(params.modelId),
});

const createDefaultCartItem = () =>
  createCartItem({
    collection: DEFAULT_COLLECTION,
    slug: DEFAULT_SLUG,
    modelId: DEFAULT_MODEL,
  });

export { createCartItem, createDefaultCartItem, DEFAULT_COLLECTION, DEFAULT_MODEL, DEFAULT_SLUG };
