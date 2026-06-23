'use client';

import { useEffect } from 'react';

import { useGLTF } from '@react-three/drei';

import { GarmentMaterialRegistryProvider } from '@providers';
import { resolveModelUrl, resolvePbrTexturePaths } from '@utils';
import { useConfiguratorProduct } from '@store';

import { GarmentMeshes } from '../GarmentMeshes';
import { PbrMapsLoader } from '../PbrMapsLoader';

const GarmentModel = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);
  const pbrPaths = resolvePbrTexturePaths(product);

  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

  const scene = <GarmentMeshes key={modelUrl} />;

  return (
    <GarmentMaterialRegistryProvider key={modelUrl}>
      <PbrMapsLoader paths={pbrPaths}>{scene}</PbrMapsLoader>
    </GarmentMaterialRegistryProvider>
  );
};

export { GarmentModel };
