import { DataTexture, NoColorSpace, RGBAFormat, type Texture } from 'three';

import type { garmentPbrUvChannelType, pbrMapsType } from '@types';

const configurePbrTexture = (texture: Texture, channel: garmentPbrUvChannelType) => {
  texture.channel = channel;
  texture.flipY = false;
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const createFallbackPbrMaps = (pbrUvChannel: garmentPbrUvChannelType = 1): pbrMapsType => {
  const bakeNormal = configurePbrTexture(new DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1, RGBAFormat), pbrUvChannel);
  const bakeAoRoughness = configurePbrTexture(new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat), pbrUvChannel);

  return { bakeNormal, bakeAoRoughness };
};

export { createFallbackPbrMaps };
