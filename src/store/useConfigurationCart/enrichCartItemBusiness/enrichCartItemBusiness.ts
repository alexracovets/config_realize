'use client';

import { useConfiguratorProduct } from '@store/useConfiguratorProduct';
import type { cartItemType, garmentBusinessType } from '@types';
import { fetchConfiguratorProductBusiness } from '@utils';

interface EnrichCartState {
  items: cartItemType[];
  activeItemId: string;
}

/** Items whose full business has already been fetched (or is in flight) — avoids duplicate requests. */
const requested = new Set<string>();

/**
 * Lazily replaces a cart item's placeholder business (from the local catalog) with the full Shopify
 * business — including the size chart and `printReferenceCm` — so the Info modal and print-size cm
 * conversion work for products added via the catalog, not only the main route product.
 *
 * No-op when the item already carries a size chart, has no slug, or the fetch fails/returns a
 * different model. When the item is still active, the active product's business is refreshed too.
 */
const enrichCartItemBusiness = async (
  get: () => EnrichCartState,
  updateItemBusiness: (itemId: string, business: garmentBusinessType) => void,
  itemId: string,
): Promise<void> => {
  const item = get().items.find((entry) => entry.id === itemId);
  if (!item || !item.slug || item.business.sizeChart || requested.has(itemId)) return;

  requested.add(itemId);

  const resolved = await fetchConfiguratorProductBusiness(item.slug, item.collectionHandle);
  const business = resolved?.business;
  // Skip when the fetch failed or resolved to a different geometry than the cart item uses.
  if (!business || resolved.modelId !== item.modelId) return;

  // The item may have been removed while the request was in flight.
  if (!get().items.some((entry) => entry.id === itemId)) return;

  updateItemBusiness(itemId, business);
  if (get().activeItemId === itemId) {
    useConfiguratorProduct.getState().setBusiness(business);
  }
};

export { enrichCartItemBusiness };
