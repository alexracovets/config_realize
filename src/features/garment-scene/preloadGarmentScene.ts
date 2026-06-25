'use client';

import { useGLTF } from '@react-three/drei';

import { useConfiguratorProduct } from '@store';
import { resolveModelUrl } from '@utils';

const preloadGarmentScene = () => {
  const product = useConfiguratorProduct.getState().product;
  useGLTF.preload(resolveModelUrl(product));
};

export { preloadGarmentScene };
