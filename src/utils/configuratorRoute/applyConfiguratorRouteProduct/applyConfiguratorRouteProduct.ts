'use client';

import type { configuratorProductHydrationType } from '@configurator/types';
import { beginGarmentModelWarmup } from '@configurator';
import type { modelIdType } from '@types';
import { useConfigurationCart, useConfiguratorSceneLoad } from '@store';
import { DEFAULT_MODEL_ID, deriveLocalBusiness, getModel, hasModel } from '@utils/garmentCatalog/garmentCatalog';

const resolveRouteModel = (slug: string, product: configuratorProductHydrationType | null) => {
  const slugModelId = hasModel(slug) ? slug : null;
  const isMapped = product != null && hasModel(product.modelId);

  const modelId = isMapped ? product.modelId : (slugModelId ?? DEFAULT_MODEL_ID);
  const business = isMapped ? product.business : slugModelId ? { ...deriveLocalBusiness(slugModelId), handle: slug } : deriveLocalBusiness(modelId);

  return { modelId: modelId as modelIdType, business };
};

const applyConfiguratorRouteProduct = (collectionHandle: string, slug: string, product: configuratorProductHydrationType | null) => {
  const { modelId, business } = resolveRouteModel(slug, product);
  const garment = getModel(modelId);

  if (garment) {
    beginGarmentModelWarmup(garment);
  }

  useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
  useConfigurationCart.getState().setActiveItemProduct({ collectionHandle, slug, modelId, business });
  useConfiguratorSceneLoad.getState().markRouteHydrated();
};

export { applyConfiguratorRouteProduct, resolveRouteModel };
