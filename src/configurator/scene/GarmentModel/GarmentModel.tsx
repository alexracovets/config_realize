'use client';

import { GarmentMaterialRegistryProvider } from '@configurator/providers';
import { buildGltfNodeIndex, GarmentMeshes, GltfSceneProvider } from '@configurator/scene';
import { GLTF_USE_DRACO, GLTF_USE_MESHOPT, resolveModelUrl } from '@configurator/utils';
import { useGLTF } from '@react-three/drei';
import { useConfiguratorProduct } from '@store';
import { type ReactNode, useMemo } from 'react';
const GarmentModel = ({ children }: { children?: ReactNode }) => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);
  const loadedGltf = useGLTF(modelUrl, GLTF_USE_DRACO, GLTF_USE_MESHOPT);
  const gltf = useMemo(() => buildGltfNodeIndex(loadedGltf), [loadedGltf]);

  return (
    <GarmentMaterialRegistryProvider key={modelUrl}>
      <GltfSceneProvider gltf={gltf}>
        <GarmentMeshes />
        {children}
      </GltfSceneProvider>
    </GarmentMaterialRegistryProvider>
  );
};

export { GarmentModel };
