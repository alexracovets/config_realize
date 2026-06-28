import type { garmentConfigType } from '@types';
import { resolveModelUrl, scheduleWhenIdle, warmDefaultDesignTextures, warmGltfModelCache, warmProductModelFile } from '@configurator/utils';

type warmProductAssetsOptionsType = {
  /** Defer GLTF parse and texture decode until idle so the loader can animate first. */
  deferHeavy?: boolean;
};

const warmProductHeavyAssets = (product: garmentConfigType) => {
  warmDefaultDesignTextures(product);
  warmGltfModelCache(resolveModelUrl(product));
};

/** Background warm-up of model file, GLTF cache, and default design textures. */
const warmProductAssets = (product: garmentConfigType, options?: warmProductAssetsOptionsType) => {
  warmProductModelFile(product);

  if (options?.deferHeavy) {
    scheduleWhenIdle(() => warmProductHeavyAssets(product));
    return;
  }

  warmProductHeavyAssets(product);
};

export { warmProductAssets };
export type { warmProductAssetsOptionsType };
