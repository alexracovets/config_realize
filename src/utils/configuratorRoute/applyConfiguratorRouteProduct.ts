import type { configuratorProductHydrationType } from '@types';
import { useConfigurationCart, useConfiguratorSceneLoad } from '@store';

import { DEFAULT_MODEL_ID, deriveLocalBusiness, hasModel } from '../garmentCatalog/garmentCatalog';
import { preloadGarmentAppearance } from '../preloadGarmentAppearance/preloadGarmentAppearance';
import { preloadGarmentProduct } from '../preloadGarmentProduct/preloadGarmentProduct';
import { preloadGarmentScene } from '@features/garment-scene';

const resolveRouteModel = (slug: string, product: configuratorProductHydrationType | null) => {
  const slugModelId = hasModel(slug) ? slug : null;
  const isMapped = product != null && hasModel(product.modelId);

  const modelId = isMapped ? product.modelId : slugModelId ?? DEFAULT_MODEL_ID;
  const business = isMapped
    ? product.business
    : slugModelId
      ? { ...deriveLocalBusiness(slugModelId), handle: slug }
      : deriveLocalBusiness(modelId);

  return { modelId, business };
};

const applyConfiguratorRouteProduct = (slug: string, product: configuratorProductHydrationType | null) => {
  const { modelId, business } = resolveRouteModel(slug, product);

  useConfiguratorSceneLoad.getState().beginInitialSceneLoad();
  useConfigurationCart.getState().setActiveItemProduct({ slug, modelId, business });
  preloadGarmentProduct(modelId);
  preloadGarmentAppearance(modelId);
  preloadGarmentScene();
  useConfiguratorSceneLoad.getState().markRouteHydrated();
};

export { applyConfiguratorRouteProduct, resolveRouteModel };
