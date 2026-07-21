'use client';

import { useConfiguratorProduct } from '@store/useConfiguratorProduct';
import type { cartItemType } from '@types';
import { fetchConfiguratorProductBusiness } from '@utils';

interface EnrichCartState {
  items: cartItemType[];
  activeItemId: string;
}

type EnrichCartSet = (partial: { items: cartItemType[] }) => void;

const requested = new Set<string>();

const enrichCartItemBusiness = async (get: () => EnrichCartState, set: EnrichCartSet, itemId: string): Promise<void> => {
  const item = get().items.find((entry) => entry.id === itemId);
  if (!item || !item.slug || item.business.sizeChart || requested.has(itemId)) return;

  requested.add(itemId);

  const resolved = await fetchConfiguratorProductBusiness(item.slug, item.collectionHandle);
  const business = resolved?.business;

  if (!business || resolved.modelId !== item.modelId) return;

  if (!get().items.some((entry) => entry.id === itemId)) return;

  set({ items: get().items.map((entry) => (entry.id === itemId ? { ...entry, business } : entry)) });
  if (get().activeItemId === itemId) {
    useConfiguratorProduct.getState().setBusiness(business);
  }
};

export { enrichCartItemBusiness };
