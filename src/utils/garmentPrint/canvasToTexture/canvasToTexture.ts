import { SRGBColorSpace, Texture } from 'three';

const canvasToTexture = (canvas: HTMLCanvasElement): Texture => {
  const texture = new Texture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
};

export { canvasToTexture };
