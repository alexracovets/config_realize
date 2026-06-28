import { imageToTexture, resolveRasterDesignSrc } from '@configurator/utils';
import type { garmentConfigType } from '@types';
/** Warm default design textures while the GLB is still loading. */
const warmDefaultDesignTextures = (product: garmentConfigType) => {
  const defaultPart = product.default_pattern?.[0]?.parts[0];
  if (!defaultPart) return;

  const src = resolveRasterDesignSrc(`${product.path}designs/${defaultPart.path_name}`);
  void imageToTexture(src);
};

export { warmDefaultDesignTextures };
