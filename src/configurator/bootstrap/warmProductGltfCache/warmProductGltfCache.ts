'use client';

import { useConfiguratorProduct } from '@store';
import type { garmentConfigType } from '@types';
import { resolveModelUrl, warmGltfModelCache } from '@configurator/utils';

const warmProductGltfCache = (product?: garmentConfigType) => {
  const resolved = product ?? useConfiguratorProduct.getState().product;
  if (!resolved) return;

  warmGltfModelCache(resolveModelUrl(resolved));
};

export { warmProductGltfCache };
