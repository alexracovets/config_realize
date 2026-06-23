import type { garmentConfigType, modelIdType } from '@types';

import { getModel } from '../garmentCatalog/garmentCatalog';
import { resolveModelUrl } from '../resolveModelUrl/resolveModelUrl';
import { resolvePbrTexturePaths } from '../resolvePbrTexturePaths/resolvePbrTexturePaths';

const preloadedAssetUrls = new Set<string>();

const preloadAssetUrl = (url: string) => {
  if (typeof window === 'undefined' || preloadedAssetUrls.has(url)) return;

  preloadedAssetUrls.add(url);

  void fetch(url, { priority: 'low' })
    .then((response) => response.blob())
    .then((blob) => {
      if (!('createImageBitmap' in window)) return;
      return createImageBitmap(blob);
    })
    .then((bitmap) => bitmap?.close())
    .catch(() => {
      preloadedAssetUrls.delete(url);
    });
};

const preloadGarmentProductAssets = (product: garmentConfigType) => {
  preloadAssetUrl(resolveModelUrl(product));

  const pbrPaths = resolvePbrTexturePaths(product);
  if (!pbrPaths) return;

  for (const url of Object.values(pbrPaths)) {
    preloadAssetUrl(url);
  }
};

const preloadGarmentProduct = (modelId: modelIdType) => {
  const product = getModel(modelId);
  if (!product) return;

  preloadGarmentProductAssets(product);
};

export { preloadGarmentProduct, preloadGarmentProductAssets };
