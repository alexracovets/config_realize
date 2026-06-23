import type { garmentConfigType, pbrTexturePathsType } from '@types';

const resolvePbrTexturePaths = (product: garmentConfigType): pbrTexturePathsType | null => {
  const files = product.pbrTextures;
  if (!files) return null;

  const base = product.path.endsWith('/') ? product.path : `${product.path}/`;

  return {
    bakeNormal: `${base}${files.bakeNormal}`,
    bakeAoRoughness: `${base}${files.bakeAoRoughness}`,
    fabricNormal: `${base}${files.fabricNormal}`,
    fabricRoughness: `${base}${files.fabricRoughness}`,
  };
};

export { resolvePbrTexturePaths };
