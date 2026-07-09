'use client';

import type { configuratorProductHydrationType } from '@configurator/types';

/**
 * Client-side fetch of the full configurator product hydration (model id + Shopify business,
 * including the size chart + `printReferenceCm`) via the server API route. Returns `null` on any
 * failure so callers can gracefully keep the existing placeholder business.
 */
const fetchConfiguratorProductBusiness = async (slug: string, collectionHandle?: string): Promise<configuratorProductHydrationType | null> => {
  const params = new URLSearchParams({ slug });
  if (collectionHandle) params.set('collectionHandle', collectionHandle);

  try {
    const response = await fetch(`/api/configurator-product?${params.toString()}`);
    if (!response.ok) return null;
    return (await response.json()) as configuratorProductHydrationType | null;
  } catch {
    return null;
  }
};

export { fetchConfiguratorProductBusiness };
