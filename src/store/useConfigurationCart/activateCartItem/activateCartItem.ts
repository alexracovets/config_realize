'use client';

import { beginGarmentModelWarmup, isGarmentModelReadyForProduct, prepareGarmentModel } from '@configurator';
import { useConfigurationControl } from '@store/useConfigurationControl';
import { useConfiguratorProduct } from '@store/useConfiguratorProduct';
import { useConfiguratorSceneLoad } from '@store/useConfiguratorSceneLoad';
import { applyGarmentConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';
import { persistCartItemConfiguration } from '@store/useConfigurationCart/persistCartItemSnapshot';
import type { cartItemConfigurationType, garmentBusinessType, modelIdType } from '@types';
import { getModel } from '@utils';

interface ActivateCartItemGetState {
  items: Array<{ id: string; modelId: modelIdType; business: garmentBusinessType }>;
  saveConfiguration: (itemId: string, configuration: cartItemConfigurationType) => void;
  getConfiguration: (itemId: string) => cartItemConfigurationType | undefined;
  savePreview: (itemId: string, previewSrc: string) => void;
}

let activationGeneration = 0;

const needsGarmentModelPrepare = (modelId: modelIdType, product: NonNullable<ReturnType<typeof getModel>>): boolean => {
  if (useConfiguratorProduct.getState().modelId !== modelId) return true;
  return !isGarmentModelReadyForProduct(product);
};

const activateCartItem = async (get: () => ActivateCartItemGetState, itemId: string, options?: { savePreviousId?: string | null }) => {
  const generation = ++activationGeneration;
  const { items, getConfiguration } = get();
  const activeIndex = items.findIndex((item) => item.id === itemId);
  const activeItem = items[activeIndex];
  if (!activeItem) return;

  const product = getModel(activeItem.modelId);
  if (!product) return;

  const configuration = getConfiguration(itemId);
  const savePreviousId = options?.savePreviousId;
  const needsPrepare = needsGarmentModelPrepare(activeItem.modelId, product);

  if (savePreviousId && savePreviousId !== itemId && items.some((item) => item.id === savePreviousId)) {

    persistCartItemConfiguration(get, savePreviousId);
  }

  if (needsPrepare) {
    const sceneLoad = useConfiguratorSceneLoad.getState();
    if (!sceneLoad.isInitialSceneLoading) {
      sceneLoad.beginSceneTransitionLoad({ affectsConfigurationPanel: true });
    }

    beginGarmentModelWarmup(product);
  } else if (useConfiguratorProduct.getState().modelId !== activeItem.modelId) {
    const sceneLoad = useConfiguratorSceneLoad.getState();
    if (!sceneLoad.isInitialSceneLoading) {
      sceneLoad.beginSceneTransitionLoad({ affectsConfigurationPanel: true });
    }
  }

  useConfiguratorProduct.getState().setProduct(activeItem.modelId, activeItem.business);
  useConfigurationControl.getState().setNumberProduct(activeIndex + 1);
  applyGarmentConfiguration(product, configuration);

  if (needsPrepare) {
    const requestedGeneration = generation;
    void prepareGarmentModel(product, { configuration })
      .catch(() => {

      })
      .finally(() => {
        if (requestedGeneration !== activationGeneration) return;
      });
  }
};

export { activateCartItem };
