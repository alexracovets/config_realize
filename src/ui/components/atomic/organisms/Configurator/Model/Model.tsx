'use client';

import { Center } from '@react-three/drei';

import { resolveModelUrl } from '../../../../../../utils/resolveModelUrl';
import { useConfiguratorProduct } from '@store';

import { GarmentModel } from '../GarmentModel';

const Model = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);

  return (
    <Center cacheKey={modelUrl}>
      <GarmentModel />
    </Center>
  );
};

export { Model };
