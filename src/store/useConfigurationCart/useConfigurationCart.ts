'use client';

import type {
  cartItemConfigurationType,
  cartItemType,
  catalogProductRefType,
  garmentBusinessType,
  modelIdType,
} from "@types";
import { getModel, preloadGarmentProduct } from "@utils";

import { create } from "zustand";

import { activateCartItem } from "./activateCartItem";
import {
  captureGarmentConfiguration,
  cloneCartItemConfiguration,
  createDefaultCartItemConfiguration,
} from "./cartItemConfiguration";
import { inheritCartItemConfiguration } from "./inheritCartItemConfiguration";
import { createCartItem, createDefaultCartItem } from "./mapCartItems";
import { persistCartItemSnapshot } from "./persistCartItemSnapshot";
import { areGarmentPrintStoresSynced } from "./areGarmentPrintStoresSynced";
import { useConfiguratorProduct } from "../useConfiguratorProduct";

interface ConfigurationCartState {
  items: cartItemType[];
  activeItemId: string;
  configurations: Record<string, cartItemConfigurationType>;
  previews: Record<string, string>;
  addItem: (
    product: Pick<catalogProductRefType, "collection" | "slug" | "modelId">,
  ) => void;
  /** Stamp a Shopify product (from the slug route loader) onto the active cart item. */
  setActiveItemProduct: (product: {
    slug: string;
    modelId: modelIdType;
    business: garmentBusinessType;
  }) => void;
  duplicateActiveItem: () => void;
  selectItem: (id: string) => void;
  removeItem: (id: string) => void;
  getActiveItemIndex: () => number;
  saveConfiguration: (
    itemId: string,
    configuration: cartItemConfigurationType,
  ) => void;
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

  addItem: (productRef) => {
    const { items, activeItemId, configurations } = get();
    const item = createCartItem(productRef);
    const newProduct = getModel(productRef.modelId);
    if (!newProduct) return;

    preloadGarmentProduct(productRef.modelId);

    persistCartItemSnapshot(get, activeItemId);

    const nextConfigurations: Record<string, cartItemConfigurationType> = {
      ...configurations,
      [activeItemId]:
        get().getConfiguration(activeItemId) ?? captureGarmentConfiguration(),
    };

    const firstItem = items[0];
    const firstProduct = getModel(firstItem.modelId);
    const referenceConfiguration =
      nextConfigurations[firstItem.id] ??
      (firstProduct
        ? createDefaultCartItemConfiguration(firstProduct)
        : createDefaultCartItemConfiguration(newProduct));

    const inheritedConfiguration = firstProduct
      ? inheritCartItemConfiguration(
          referenceConfiguration,
          firstProduct,
          newProduct,
        )
      : createDefaultCartItemConfiguration(newProduct);

    set({
      items: [...items, item],
      activeItemId: item.id,
      configurations: {
        ...nextConfigurations,
        [item.id]: inheritedConfiguration,
      },
      previews: get().previews,
    });

    activateCartItem(get, item.id);
  },

  setActiveItemProduct: ({ slug, modelId, business }) => {
    const { items, activeItemId, configurations } = get();
    const activeItem = items.find((item) => item.id === activeItemId);
    if (!activeItem) return;
    if (!getModel(modelId)) return;

    // The geometry (modelId) is what drives the heavy 3D rebuild. The default cart item
    // is already initialised with the default model, so when the loaded product maps to the
    // SAME model we must NOT reset/reactivate — that would rebuild the whole scene a second
    // time on every open. Only the slug + business need refreshing in that case.
    if (activeItem.modelId === modelId) {
      set({
        items: items.map((item) => (item.id === activeItemId ? { ...item, slug, business } : item)),
      });
      useConfiguratorProduct.getState().initFromLoader(modelId, business);

      const product = getModel(modelId);
      if (product && !areGarmentPrintStoresSynced(product.path)) {
        activateCartItem(get, activeItemId);
      }

      return;
    }

    // Different model: reset this item's configuration so it rebuilds from the new model defaults.
    const nextConfigurations = Object.fromEntries(
      Object.entries(configurations).filter(([itemId]) => itemId !== activeItemId),
    );

    set({
      items: items.map((item) => (item.id === activeItemId ? { ...item, slug, modelId, business } : item)),
      configurations: nextConfigurations,
    });

    activateCartItem(get, activeItemId);
  },

  duplicateActiveItem: () => {
    const { items, activeItemId, configurations } = get();
    const activeItem = items.find((item) => item.id === activeItemId);
    if (!activeItem) return;

    persistCartItemSnapshot(get, activeItemId);

    const currentConfiguration =
      get().getConfiguration(activeItemId) ?? captureGarmentConfiguration();
    const activePreview = get().getPreview(activeItemId);

    const duplicatedItem = createCartItem({
      collection: activeItem.collection,
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
      previews: activePreview
        ? { ...get().previews, [duplicatedItem.id]: activePreview }
        : get().previews,
    });

    activateCartItem(get, duplicatedItem.id);
  },

  selectItem: (id) => {
    const { items, activeItemId } = get();
    if (!items.some((item) => item.id === id) || activeItemId === id) return;

    activateCartItem(get, id, { savePreviousId: activeItemId });
    set({ activeItemId: id });
  },

  removeItem: (id) => {
    const { items, activeItemId, configurations, previews } = get();
    if (items.length <= 1) return;

    const nextItems = items.filter((item) => item.id !== id);
    const nextActiveId = activeItemId === id ? nextItems[0].id : activeItemId;
    const nextConfigurations = Object.fromEntries(
      Object.entries(configurations).filter(([itemId]) => itemId !== id),
    );
    const nextPreviews = Object.fromEntries(
      Object.entries(previews).filter(([itemId]) => itemId !== id),
    );
    const wasActive = activeItemId === id;

    set({
      items: nextItems,
      activeItemId: nextActiveId,
      configurations: nextConfigurations,
      previews: nextPreviews,
    });

    if (wasActive) {
      activateCartItem(get, nextActiveId);
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

export { useConfigurationCart };
