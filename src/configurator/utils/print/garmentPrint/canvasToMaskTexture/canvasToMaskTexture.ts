import { ClampToEdgeWrapping, LinearFilter, NoColorSpace, Texture } from 'three';

const canvasToMaskTexture = (canvas: HTMLCanvasElement): Texture => {
  const texture = new Texture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.premultiplyAlpha = false;
  texture.flipY = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
};

export { canvasToMaskTexture };
