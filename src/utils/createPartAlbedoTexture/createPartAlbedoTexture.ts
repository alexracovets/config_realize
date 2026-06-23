import { CanvasTexture, ClampToEdgeWrapping, SRGBColorSpace } from 'three';

const createPartAlbedoTexture = (canvas: HTMLCanvasElement) => {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};

export { createPartAlbedoTexture };
