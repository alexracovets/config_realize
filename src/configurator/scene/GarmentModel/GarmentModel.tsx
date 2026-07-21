'use client';

import { GarmentMaterialRegistryProvider } from '@configurator/providers';

import { GarmentMeshes } from '@configurator/scene/GarmentMeshes';
import { buildGltfNodeIndex } from '@configurator/scene/gltf';
import { GltfSceneProvider } from '@configurator/scene/GltfSceneProvider';
import { GLTF_USE_DRACO, GLTF_USE_MESHOPT, resolveModelUrl } from '@configurator/utils';
import { useGLTF } from '@react-three/drei';
import { useConfiguratorProduct } from '@store';
import { type ReactNode, Suspense, useMemo } from 'react';

const GarmentModelLoaded = ({ modelUrl, children }: { modelUrl: string; children?: ReactNode }) => {
  const loadedGltf = useGLTF(modelUrl, GLTF_USE_DRACO, GLTF_USE_MESHOPT);
  const gltf = useMemo(() => buildGltfNodeIndex(loadedGltf), [loadedGltf]);

  return (
    <GltfSceneProvider gltf={gltf}>
      <GarmentMeshes />
      {children}
    </GltfSceneProvider>
  );
};

const GarmentModelGate = ({ modelUrl, children }: { modelUrl: string; children?: ReactNode }) => {
  return (
    <GarmentMaterialRegistryProvider key={modelUrl}>
      <Suspense fallback={null}>
        <GarmentModelLoaded modelUrl={modelUrl}>{children}</GarmentModelLoaded>
      </Suspense>
    </GarmentMaterialRegistryProvider>
  );
};

const GarmentModel = ({ children }: { children?: ReactNode }) => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);

  return (
    <GarmentModelGate key={modelUrl} modelUrl={modelUrl}>
      {children}
    </GarmentModelGate>
  );
};

export { GarmentModel };
