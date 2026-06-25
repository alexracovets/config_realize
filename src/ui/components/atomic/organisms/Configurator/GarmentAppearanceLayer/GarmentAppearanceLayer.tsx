'use client';

import { memo } from 'react';

import { useGarmentAppearance } from '@hooks';

/** R3F side-effect layer: colore, design, shading → garment material uniforms. */
const GarmentAppearanceLayer = memo(() => {
  useGarmentAppearance();
  return null;
});

GarmentAppearanceLayer.displayName = 'GarmentAppearanceLayer';

export { GarmentAppearanceLayer };
