'use client';

import { useGLTF } from '@react-three/drei';

import { useConfiguratorProduct } from '@store';
import { resolveModelUrl, resolvePbrTexturePaths } from '@utils';

const preloadConfiguratorScene = () => {
  const product = useConfiguratorProduct.getState().product;
  const modelUrl = resolveModelUrl(product);

  useGLTF.preload(modelUrl);

  const pbrPaths = resolvePbrTexturePaths(product);
  if (!pbrPaths) return;

  for (const url of Object.values(pbrPaths)) {
    void fetch(url, { priority: 'low' });
  }
};

export { preloadConfiguratorScene };
