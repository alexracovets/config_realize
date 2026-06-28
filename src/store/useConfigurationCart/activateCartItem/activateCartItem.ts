'use client';

import { useConfigurationControl } from '@store/useConfigurationControl';
import { useConfiguratorProduct } from '@store/useConfiguratorProduct';
import { applyGarmentConfiguration, captureGarmentConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';
import { persistCartItemSnapshot } from '@store/useConfigurationCart/persistCartItemSnapshot';
import type { cartItemConfigurationType, garmentBusinessType, modelIdType } from '@types';
import { warmProductAssets } from '@configurator';
import { getModel } from '@utils';
interface ActivateCartItemGetState {
  items: Array<{ id: string; modelId: modelIdType; business: garmentBusinessType }>;
  saveConfiguration: (itemId: string, configuration: cartItemConfigurationType) => void;
  getConfiguration: (itemId: string) => cartItemConfigurationType | undefined;
  savePreview: (itemId: string, previewSrc: string) => void;
}

const activateCartItem = (get: () => ActivateCartItemGetState, itemId: string, options?: { savePreviousId?: string | null }) => {
  const { items, saveConfiguration, getConfiguration } = get();
  const activeIndex = items.findIndex((item) => item.id === itemId);
  const activeItem = items[activeIndex];
  if (!activeItem) return;

  const savePreviousId = options?.savePreviousId;
  if (savePreviousId && savePreviousId !== itemId && items.some((item) => item.id === savePreviousId)) {
    persistCartItemSnapshot(get, savePreviousId);
  }

  const product = getModel(activeItem.modelId);
  if (!product) return;

  warmProductAssets(product, { deferHeavy: true });
  useConfiguratorProduct.getState().setProduct(activeItem.modelId, activeItem.business);
  useConfigurationControl.getState().setNumberProduct(activeIndex + 1);

  const configuration = getConfiguration(itemId);
  applyGarmentConfiguration(product, configuration);

  if (!configuration) {
    saveConfiguration(itemId, captureGarmentConfiguration());
  }
};

export { activateCartItem };
