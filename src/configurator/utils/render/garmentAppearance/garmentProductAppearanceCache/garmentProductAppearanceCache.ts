import type { productAppearanceTexturesType } from '@configurator/types';
import type { designPatternItemType } from '@types';
import { emptyMaskPair, resolveRasterDesignSrc } from '@configurator/utils';

const appearanceByProductPath = new Map<string, productAppearanceTexturesType>();
let appearanceCacheVersion = 0;

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
  appearanceCacheVersion += 1;
};

const readProductAppearanceTextures = (productPath: string): productAppearanceTexturesType => getProductAppearanceTextures(productPath);

const getAppearanceCacheVersion = (): number => appearanceCacheVersion;

const isGarmentAppearanceCached = (
  productPath: string,
  defaultPattern: designPatternItemType | null,
  activePatternKey: string | null,
): boolean => {
  const cached = readProductAppearanceTextures(productPath);
  const logosSrc = defaultPattern?.parts[0]?.src ? resolveRasterDesignSrc(defaultPattern.parts[0].src) : null;

  if (logosSrc && !cached.logosTexture) return false;

  if (activePatternKey && cached.masksPatternKey !== activePatternKey) return false;
  if (activePatternKey && !cached.maskTextures[0]) return false;

  return true;
};

export {
  getAppearanceCacheVersion,
  isGarmentAppearanceCached,
  readProductAppearanceTextures,
  syncProductAppearanceTextures,
};
