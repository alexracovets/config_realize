import { PATTERN_LAYER_COUNT } from '@configurator/constants';
import { mapDefaultPattern, mapProductDesigns } from '@configurator/mappers';
import { waitForProductModelReady } from '@configurator/scene';
import {
  emptyMaskPair,
  imageToMaskTexture,
  imageToTexture,
  isGltfModelReady,
  loadCachedImage,
  preloadGarmentGltfEager,
  resolveModelUrl,
  resolveRasterDesignSrc,
  syncProductAppearanceTextures,
  warmProductModelFile,
  yieldToMain,
} from '@configurator/utils';
import type { cartItemConfigurationType, garmentConfigType } from '@types';

type prepareGarmentModelOptionsType = {
  configuration?: cartItemConfigurationType;
};

const preloadGarmentLogoSources = async (configuration?: cartItemConfigurationType) => {
  const instances = configuration?.logo?.instances ?? [];
  if (instances.length === 0) return;

  for (const instance of instances) {
    if (!instance.src) continue;

    try {
      await loadCachedImage(instance.src);
    } catch {
      /* optional user uploads */
    }

    await yieldToMain();
  }
};

const preloadGarmentDesignTextures = async (product: garmentConfigType, configuration?: cartItemConfigurationType) => {
  const defaultPattern = mapDefaultPattern(product);
  const logosPart = defaultPattern?.parts[0];
  let logosTexture = null;

  if (logosPart?.src) {
    logosTexture = await imageToTexture(resolveRasterDesignSrc(logosPart.src));
    await yieldToMain();
  }

  const activePatternKey = configuration?.design?.activePatternKey;
  const maskTextures = emptyMaskPair();
  let masksPatternKey: string | null = null;

  if (activePatternKey) {
    const activePattern = mapProductDesigns(product).find((pattern) => pattern.key === activePatternKey);
    if (activePattern) {
      masksPatternKey = activePatternKey;

      for (const [index, part] of activePattern.parts.slice(0, PATTERN_LAYER_COUNT).entries()) {
        maskTextures[index] = await imageToMaskTexture(resolveRasterDesignSrc(part.src));
        await yieldToMain();
      }
    }
  }

  syncProductAppearanceTextures(product.path, {
    logosTexture,
    maskTextures,
    masksPatternKey,
  });
};

/** Start network + GLTF parse without blocking route activation. */
const beginGarmentModelWarmup = (product: garmentConfigType) => {
  const modelUrl = resolveModelUrl(product);
  warmProductModelFile(product, { priority: 'high' });
  preloadGarmentGltfEager(modelUrl);
};

/** Eager network warm-up + GLTF parse + design/logo textures for catalog hover / background prepare. */
const prepareGarmentModel = async (product: garmentConfigType, options?: prepareGarmentModelOptionsType): Promise<void> => {
  const modelUrl = resolveModelUrl(product);

  beginGarmentModelWarmup(product);

  const gltfReady = isGltfModelReady(modelUrl) ? Promise.resolve() : waitForProductModelReady(product);

  await Promise.all([gltfReady, preloadGarmentDesignTextures(product, options?.configuration)]);
  await preloadGarmentLogoSources(options?.configuration);
  await yieldToMain();
};

/** Returns whether the garment GLB for this product is already in the R3F GLTF cache. */
const isGarmentModelReadyForProduct = (product: garmentConfigType): boolean => isGltfModelReady(resolveModelUrl(product));

export { beginGarmentModelWarmup, isGarmentModelReadyForProduct, prepareGarmentModel };
export type { prepareGarmentModelOptionsType };
