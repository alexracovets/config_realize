import { ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, SRGBColorSpace, Texture } from 'three';

import type { imageTextureOptionsType } from '@types';
import { loadCachedImage } from '../../loadCachedImage/loadCachedImage';

const textureCache = new Map<string, Texture>();
const maskTextureCache = new Map<string, Texture>();

const configureImageTextureSampling = (texture: Texture, options?: imageTextureOptionsType) => {
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  if (options?.anisotropy) {
    texture.anisotropy = options.anisotropy;
  }
};

const configureMaskTextureSampling = (texture: Texture, options?: imageTextureOptionsType) => {
  texture.colorSpace = NoColorSpace;
  texture.premultiplyAlpha = false;
  texture.flipY = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  if (options?.anisotropy) {
    texture.anisotropy = options.anisotropy;
  }
};

const imageToTexture = async (src: string, options?: imageTextureOptionsType): Promise<Texture> => {
  const cached = textureCache.get(src);
  if (cached) return cached;

  const image = await loadCachedImage(src);
  const texture = new Texture(image);
  configureImageTextureSampling(texture, options);
  texture.needsUpdate = true;
  textureCache.set(src, texture);

  return texture;
};

const imageToMaskTexture = async (src: string, options?: imageTextureOptionsType): Promise<Texture> => {
  const cached = maskTextureCache.get(src);
  if (cached) return cached;

  const image = await loadCachedImage(src);
  const texture = new Texture(image);
  configureMaskTextureSampling(texture, options);
  texture.needsUpdate = true;
  maskTextureCache.set(src, texture);

  return texture;
};

const clearImageTextureCache = () => {
  for (const texture of textureCache.values()) {
    texture.dispose();
  }
  textureCache.clear();

  for (const texture of maskTextureCache.values()) {
    texture.dispose();
  }
  maskTextureCache.clear();
};

export { clearImageTextureCache, configureImageTextureSampling, configureMaskTextureSampling, imageToMaskTexture, imageToTexture };
