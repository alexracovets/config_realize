'use client';

import { useConfiguratorProduct } from '@store/useConfiguratorProduct';
import { activateCartItem } from '@store/useConfigurationCart/activateCartItem';
import { areGarmentPrintStoresSynced } from '@store/useConfigurationCart/areGarmentPrintStoresSynced';
import { captureGarmentConfiguration, cloneCartItemConfiguration, createDefaultCartItemConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';
import { inheritCartItemConfiguration } from '@store/useConfigurationCart/inheritCartItemConfiguration';
import { createCartItem, createDefaultCartItem } from '@store/useConfigurationCart/mapCartItems';
import { enrichCartItemBusiness } from '@store/useConfigurationCart/enrichCartItemBusiness';
import { persistCartItemSnapshot } from '@store/useConfigurationCart/persistCartItemSnapshot';
import { syncActiveCartItemToEmbeddedUrl } from '@store/useConfigurationCart/syncActiveCartItemToEmbeddedUrl';
import type { cartItemConfigurationType, cartItemType, configuratorCatalogProductPickType, garmentBusinessType, modelIdType } from '@types';
import { getModel } from '@utils';
import { create } from 'zustand';
interface ConfigurationCartState {
  items: cartItemType[];
  activeItemId: string;
  configurations: Record<string, cartItemConfigurationType>;
  previews: Record<string, string>;
  addItem: (product: configuratorCatalogProductPickType, options?: { inheritDesign?: boolean }) => void;
  setActiveItemProduct: (product: { collectionHandle: string; slug: string; modelId: modelIdType; business: garmentBusinessType }) => void;
  duplicateActiveItem: () => void;
  selectItem: (id: string) => void;
  removeItem: (id: string) => void;
  getActiveItemIndex: () => number;
  saveConfiguration: (itemId: string, configuration: cartItemConfigurationType) => void;
  getConfiguration: (itemId: string) => cartItemConfigurationType | undefined;
  savePreview: (itemId: string, previewSrc: string) => void;
  getPreview: (itemId: string) => string | undefined;
  persistActiveItemSnapshot: () => void;
}

const initialItem = createDefaultCartItem();

const useConfigurationCart = create<ConfigurationCartState>((set, get) => ({
  items: [initialItem],
  activeItemId: initialItem.id,
  configurations: {},
  previews: {},

  addItem: (productRef, options) => {
    const inheritDesign = options?.inheritDesign ?? false;
    const { items, activeItemId, configurations } = get();
    const item = createCartItem(productRef);
    const newProduct = getModel(productRef.modelId);
    if (!newProduct) return;

    persistCartItemSnapshot(get, activeItemId, { previewMode: 'sync' });

    const referenceItem = items.find((entry) => entry.id === activeItemId) ?? items[0];
    const referenceProduct = getModel(referenceItem.modelId);
    const referenceConfiguration = captureGarmentConfiguration();

    const nextConfigurations: Record<string, cartItemConfigurationType> = {
      ...configurations,
      [referenceItem.id]: referenceConfiguration,
    };

    const nextConfiguration =
      inheritDesign && referenceProduct
        ? inheritCartItemConfiguration(referenceConfiguration, referenceProduct, newProduct)
        : createDefaultCartItemConfiguration(newProduct);

    set({
      items: [...items, item],
      activeItemId: item.id,
      configurations: {
        ...nextConfigurations,
        [item.id]: nextConfiguration,
      },
      previews: get().previews,
    });

    void activateCartItem(get, item.id);

    // Catalog picks carry only placeholder business — lazily fetch the full Shopify business
    // (size chart + printReferenceCm) so the Info modal and cm print sizes work for added products.
    void enrichCartItemBusiness(get, set, item.id);
  },

  setActiveItemProduct: ({ collectionHandle, slug, modelId, business }) => {
    const { items, activeItemId, configurations } = get();
    const activeItem = items.find((item) => item.id === activeItemId);
    if (!activeItem) return;
    if (!getModel(modelId)) return;
    if (activeItem.modelId === modelId) {
      set({
        items: items.map((item) => (item.id === activeItemId ? { ...item, collectionHandle, slug, business, isPlaceholder: false } : item)),
      });
      useConfiguratorProduct.getState().initFromLoader(modelId, business);

      const product = getModel(modelId);
      if (product && !areGarmentPrintStoresSynced(product.path)) {
        void activateCartItem(get, activeItemId);
      }

      return;
    }

    const nextConfigurations = Object.fromEntries(Object.entries(configurations).filter(([itemId]) => itemId !== activeItemId));

    set({
      items: items.map((item) => (item.id === activeItemId ? { ...item, collectionHandle, slug, modelId, business, isPlaceholder: false } : item)),
      configurations: nextConfigurations,
    });

    void activateCartItem(get, activeItemId);
  },

  duplicateActiveItem: () => {
    const { items, activeItemId, configurations } = get();
    const activeItem = items.find((item) => item.id === activeItemId);
    if (!activeItem) return;

    persistCartItemSnapshot(get, activeItemId, { previewMode: 'sync' });

    const currentConfiguration = get().getConfiguration(activeItemId) ?? captureGarmentConfiguration();
    const activePreview = get().getPreview(activeItemId);

    const duplicatedItem = createCartItem({
      collectionHandle: activeItem.collectionHandle,
      slug: activeItem.slug,
      modelId: activeItem.modelId,
      business: activeItem.business,
    });

    set({
      items: [...items, duplicatedItem],
      activeItemId: duplicatedItem.id,
      configurations: {
        ...configurations,
        [activeItemId]: currentConfiguration,
        [duplicatedItem.id]: cloneCartItemConfiguration(currentConfiguration),
      },
      previews: activePreview ? { ...get().previews, [duplicatedItem.id]: activePreview } : get().previews,
    });

    void activateCartItem(get, duplicatedItem.id);
  },

  selectItem: (id) => {
    const { items, activeItemId } = get();
    if (!items.some((item) => item.id === id) || activeItemId === id) return;

    persistCartItemSnapshot(get, activeItemId, { previewMode: 'sync' });
    void activateCartItem(get, id, { savePreviousId: activeItemId });
    set({ activeItemId: id });
  },

  removeItem: (id) => {
    const { items, activeItemId, configurations, previews } = get();
    if (items.length <= 1) return;

    const nextItems = items.filter((item) => item.id !== id);
    const nextActiveId = activeItemId === id ? nextItems[0].id : activeItemId;
    const nextConfigurations = Object.fromEntries(Object.entries(configurations).filter(([itemId]) => itemId !== id));
    const nextPreviews = Object.fromEntries(Object.entries(previews).filter(([itemId]) => itemId !== id));
    const wasActive = activeItemId === id;

    set({
      items: nextItems,
      activeItemId: nextActiveId,
      configurations: nextConfigurations,
      previews: nextPreviews,
    });

    if (wasActive) {
      void activateCartItem(get, nextActiveId);
    }
  },

  getActiveItemIndex: () => {
    const { items, activeItemId } = get();
    return items.findIndex((item) => item.id === activeItemId);
  },

  saveConfiguration: (itemId, configuration) => {
    set((state) => ({
      configurations: {
        ...state.configurations,
        [itemId]: cloneCartItemConfiguration(configuration),
      },
    }));
  },

  getConfiguration: (itemId) => get().configurations[itemId],

  savePreview: (itemId, previewSrc) => {
    set((state) => ({
      previews: {
        ...state.previews,
        [itemId]: previewSrc,
      },
    }));
  },

  getPreview: (itemId) => get().previews[itemId],

  persistActiveItemSnapshot: () => {
    const { activeItemId } = get();
    persistCartItemSnapshot(get, activeItemId);
  },
}));

syncActiveCartItemToEmbeddedUrl(useConfigurationCart.subscribe);

export { useConfigurationCart };
