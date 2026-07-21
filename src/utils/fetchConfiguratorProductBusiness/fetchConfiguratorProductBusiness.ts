'use client';

import type { configuratorProductHydrationType } from '@configurator/types';

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
