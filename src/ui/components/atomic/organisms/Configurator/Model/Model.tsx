'use client';

import { Center } from '@react-three/drei';

import { GarmentModel } from '@features/garment-scene';

import { GarmentLogoTextureLayer } from '../GarmentLogoTextureLayer';
import { GarmentNameTextureLayer } from '../GarmentNameTextureLayer';
import { GarmentTextureLayer } from '../GarmentTextureLayer';
import { PrintGizmoLayer } from '../PrintGizmoLayer';

const Model = () => {
  return (
    <Center>
      <GarmentModel>
        <GarmentTextureLayer />
        <GarmentNameTextureLayer />
        <GarmentLogoTextureLayer />
        <PrintGizmoLayer />
      </GarmentModel>
    </Center>
  );
};

export { Model };
