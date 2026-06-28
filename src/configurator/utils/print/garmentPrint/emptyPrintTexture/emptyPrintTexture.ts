import { DataTexture, RGBAFormat } from 'three';

let emptyPrintTexture: DataTexture | null = null;

const getEmptyPrintTexture = () => {
  if (!emptyPrintTexture) {
    emptyPrintTexture = new DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, RGBAFormat);
    emptyPrintTexture.needsUpdate = true;
  }
  return emptyPrintTexture;
};

export { getEmptyPrintTexture };
