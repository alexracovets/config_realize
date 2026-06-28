import type { productAppearanceTexturesType } from '@configurator/types';
import { emptyMaskPair } from '@configurator/utils';
const appearanceByProductPath = new Map<string, productAppearanceTexturesType>();

const getProductAppearanceTextures = (productPath: string): productAppearanceTexturesType => {
  const existing = appearanceByProductPath.get(productPath);
  if (existing) return existing;

  const created: productAppearanceTexturesType = {
    logosTexture: null,
    maskTextures: emptyMaskPair(),
    masksPatternKey: null,
  };

  appearanceByProductPath.set(productPath, created);
  return created;
};

const syncProductAppearanceTextures = (
  productPath: string,
  textures: Pick<productAppearanceTexturesType, 'logosTexture' | 'maskTextures' | 'masksPatternKey'>,
) => {
  const cache = getProductAppearanceTextures(productPath);
  cache.logosTexture = textures.logosTexture;
  cache.maskTextures = textures.maskTextures;
  cache.masksPatternKey = textures.masksPatternKey;
};

const readProductAppearanceTextures = (productPath: string): productAppearanceTexturesType => getProductAppearanceTextures(productPath);

export { readProductAppearanceTextures, syncProductAppearanceTextures };
