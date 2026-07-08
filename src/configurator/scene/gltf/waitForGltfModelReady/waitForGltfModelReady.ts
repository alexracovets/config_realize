import type { GLTF } from 'three-stdlib';

import type { garmentConfigType } from '@types';
import { isGltfModelReady, preloadGarmentGltfEager, readCachedGarmentGltf, resolveModelUrl, yieldToMain } from '@configurator/utils';

const GLTF_PARSE_TIMEOUT_MS = 60_000;

const waitForGltfModelReady = async (modelUrl: string): Promise<GLTF> => {
  const cached = readCachedGarmentGltf(modelUrl);
  if (cached) return cached;

  preloadGarmentGltfEager(modelUrl);

  const startedAt = performance.now();

  while (!isGltfModelReady(modelUrl)) {
    if (performance.now() - startedAt > GLTF_PARSE_TIMEOUT_MS) {
      throw new Error(`Timed out while parsing garment GLTF: ${modelUrl}`);
    }

    await yieldToMain();
  }

  const parsed = readCachedGarmentGltf(modelUrl);
  if (!parsed) {
    throw new Error(`Garment GLTF missing from cache after parse: ${modelUrl}`);
  }

  return parsed;
};

const waitForProductModelReady = async (product: garmentConfigType) => waitForGltfModelReady(resolveModelUrl(product));

export { waitForGltfModelReady, waitForProductModelReady };
