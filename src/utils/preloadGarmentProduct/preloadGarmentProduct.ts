import type { garmentConfigType, modelIdType } from '@types';

import { getModel } from '../garmentCatalog/garmentCatalog';
import { resolveModelUrl } from '../resolveModelUrl/resolveModelUrl';

const preloadedAssetUrls = new Set<string>();

const preloadAssetUrl = (url: string) => {
  if (typeof window === 'undefined' || preloadedAssetUrls.has(url)) return;

  preloadedAssetUrls.add(url);

  void fetch(url, { priority: 'low' }).catch(() => {
    preloadedAssetUrls.delete(url);
  });
};

const preloadGarmentProductAssets = (product: garmentConfigType) => {
  preloadAssetUrl(resolveModelUrl(product));
};

const preloadGarmentProduct = (modelId: modelIdType) => {
  const product = getModel(modelId);
  if (!product) return;

  preloadGarmentProductAssets(product);
};

export { preloadGarmentProduct, preloadGarmentProductAssets };
