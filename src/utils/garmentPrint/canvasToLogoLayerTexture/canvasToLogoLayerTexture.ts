import { ClampToEdgeWrapping, LinearFilter, NoColorSpace, RGBAFormat, Texture } from 'three';

const canvasToLogoLayerTexture = (canvas: HTMLCanvasElement): Texture => {
  const texture = new Texture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.format = RGBAFormat;
  texture.premultiplyAlpha = false;
  texture.flipY = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export { canvasToLogoLayerTexture };
