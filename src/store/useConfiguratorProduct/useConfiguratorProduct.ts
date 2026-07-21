'use client';

import type { garmentBusinessType, garmentConfigType, modelIdType } from '@types';
import { DEFAULT_MODEL_ID, deriveLocalBusiness, getModel } from '@utils';

import { createSingletonStore } from '@store/createSingletonStore';

interface ConfiguratorProductState {
  modelId: modelIdType;

  product: garmentConfigType;

  business: garmentBusinessType;

  setProduct: (modelId: modelIdType, business?: garmentBusinessType) => void;

  setBusiness: (business: garmentBusinessType) => void;

  initFromLoader: (modelId: modelIdType, business: garmentBusinessType) => void;
}

const resolveModel = (modelId: modelIdType): garmentConfigType => {
  const product = getModel(modelId);
  if (!product) throw new Error(`Model not found: ${modelId}`);
  return product;
};

const useConfiguratorProduct = createSingletonStore<ConfiguratorProductState>('useConfiguratorProduct', (set) => ({
  modelId: DEFAULT_MODEL_ID,
  product: resolveModel(DEFAULT_MODEL_ID),
  business: deriveLocalBusiness(DEFAULT_MODEL_ID),
  setProduct: (modelId, business) => {
    set({
      modelId,
      product: resolveModel(modelId),
      business: business ?? deriveLocalBusiness(modelId),
    });
  },
  setBusiness: (business) => {
    set({ business });
  },
  initFromLoader: (modelId, business) => {
    set({
      modelId,
      product: resolveModel(modelId),
      business,
    });
  },
}));

export { useConfiguratorProduct };
