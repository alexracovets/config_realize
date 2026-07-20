'use client';

import { GarmentMaterialRegistryProvider } from '@configurator/providers';
import { buildGltfNodeIndex, GarmentMeshes, GltfSceneProvider } from '@configurator/scene';
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

// The registry provider must sit outside the Suspense boundary: useGLTF suspends
// GarmentModelLoaded, and a provider rendered inside it would not be mounted while
// children (GarmentRuntime) already read the registry context.
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
