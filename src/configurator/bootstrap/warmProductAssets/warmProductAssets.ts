import type { garmentConfigType } from '@types';
import { resolveModelUrl, scheduleWhenIdle, warmDefaultDesignTextures, warmGltfModelCache, warmProductModelFile } from '@configurator/utils';

type warmProductAssetsOptionsType = {

  deferHeavy?: boolean;
};

const warmProductHeavyAssets = (product: garmentConfigType) => {
  warmDefaultDesignTextures(product);
  warmGltfModelCache(resolveModelUrl(product));
};

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
