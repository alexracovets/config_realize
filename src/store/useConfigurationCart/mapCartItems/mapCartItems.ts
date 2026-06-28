'use client';

import type { cartItemType, garmentBusinessType, modelIdType } from '@types';
import { DEFAULT_CONFIGURATOR_COLLECTION_HANDLE, DEFAULT_CONFIGURATOR_MODEL_ID, DEFAULT_CONFIGURATOR_SLUG } from '@constants';
import { deriveLocalBusiness } from '@utils';

const createCartItem = (params: {
  collectionHandle: string;
  slug: string;
  modelId: modelIdType;
  business?: garmentBusinessType;
}): cartItemType => ({
  id: `cart-${params.collectionHandle}-${params.slug}-${crypto.randomUUID()}`,
  collectionHandle: params.collectionHandle,
  slug: params.slug,
  modelId: params.modelId,
  business: params.business ?? deriveLocalBusiness(params.modelId),
});

const createDefaultCartItem = () =>
  createCartItem({
    collectionHandle: DEFAULT_CONFIGURATOR_COLLECTION_HANDLE,
    slug: DEFAULT_CONFIGURATOR_SLUG,
    modelId: DEFAULT_CONFIGURATOR_MODEL_ID,
  });

export { createCartItem, createDefaultCartItem };
