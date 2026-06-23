'use client';

import { memo } from 'react';

import { useGarmentNameTextures } from '@hooks';

const GarmentNameTextureLayer = memo(() => {
  useGarmentNameTextures();
  return null;
});

GarmentNameTextureLayer.displayName = 'GarmentNameTextureLayer';

export { GarmentNameTextureLayer };
