'use client';

import { memo } from 'react';

import { useGarmentTextures } from '@hooks';

const GarmentTextureLayer = memo(() => {
  useGarmentTextures();
  return null;
});

GarmentTextureLayer.displayName = 'GarmentTextureLayer';

export { GarmentTextureLayer };
