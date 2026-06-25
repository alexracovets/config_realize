import type { modelIdType } from '@types';

import { getModel } from '../garmentCatalog/garmentCatalog';
import { imageToTexture } from '../garmentPrint/imageToTexture';
import { resolveRasterDesignSrc } from '../garmentPrint/resolveRasterDesignSrc';

/** Warm default design / logos textures while the GLB is still loading. */
const preloadGarmentAppearance = (modelId: modelIdType) => {
  const product = getModel(modelId);
  const defaultPart = product?.default_pattern?.[0]?.parts[0];
  if (!product || !defaultPart) return;

  const src = resolveRasterDesignSrc(`${product.path}designs/${defaultPart.path_name}`);
  void imageToTexture(src);
};

export { preloadGarmentAppearance };
