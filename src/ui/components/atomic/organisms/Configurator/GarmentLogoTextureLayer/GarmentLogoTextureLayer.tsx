'use client';

import { memo } from 'react';

import { useGarmentLogoTextures } from '@hooks';

const GarmentLogoTextureLayer = memo(() => {
  useGarmentLogoTextures();
  return null;
});

GarmentLogoTextureLayer.displayName = 'GarmentLogoTextureLayer';

export { GarmentLogoTextureLayer };
