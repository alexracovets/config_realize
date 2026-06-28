'use client';

import type { garmentBusinessType, garmentConfigType, modelIdType } from '@types';
import { DEFAULT_MODEL_ID, deriveLocalBusiness, getModel } from '@utils';

import { create } from 'zustand';

interface ConfiguratorProductState {
  modelId: modelIdType;
  /** Local 3D geometry/design config. */
  product: garmentConfigType;
  /** Business data (price, bonuses, name) sourced from the Shopify product. */
  business: garmentBusinessType;
  /** Switch the active model; business defaults to the local fallback unless provided. */
  setProduct: (modelId: modelIdType, business?: garmentBusinessType) => void;
  /** Hydrate from a route loader (Shopify product → model id + business). */
  initFromLoader: (modelId: modelIdType, business: garmentBusinessType) => void;
}

const resolveModel = (modelId: modelIdType): garmentConfigType => {
  const product = getModel(modelId);
  if (!product) throw new Error(`Model not found: ${modelId}`);
  return product;
};

const useConfiguratorProduct = create<ConfiguratorProductState>((set) => ({
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
  initFromLoader: (modelId, business) => {
    set({
      modelId,
      product: resolveModel(modelId),
      business,
    });
  },
}));

export { useConfiguratorProduct };
