import type { imageTextureOptionsType } from '@configurator/types';
import { loadCachedImage } from '@configurator/utils';
import { ClampToEdgeWrapping, LinearFilter, NoColorSpace, SRGBColorSpace, Texture } from 'three';
const textureCache = new Map<string, Texture>();
const maskTextureCache = new Map<string, Texture>();

const configureImageTextureSampling = (texture: Texture, options?: imageTextureOptionsType) => {
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
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

export { configureImageTextureSampling, configureMaskTextureSampling, imageToMaskTexture, imageToTexture };
