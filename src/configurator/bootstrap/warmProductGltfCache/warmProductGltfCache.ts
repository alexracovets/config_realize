'use client';

import { useConfiguratorProduct } from '@store';
import type { garmentConfigType } from '@types';
import { resolveModelUrl, warmGltfModelCache } from '@configurator/utils';

/** Warm R3F GLTF cache for the active or given product. */
const warmProductGltfCache = (product?: garmentConfigType) => {
  const resolved = product ?? useConfiguratorProduct.getState().product;
  if (!resolved) return;

  warmGltfModelCache(resolveModelUrl(resolved));
};

export { warmProductGltfCache };
