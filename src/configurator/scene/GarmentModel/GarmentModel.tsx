'use client';

import { GarmentMaterialRegistryProvider } from '@configurator/providers';
import { buildGltfNodeIndex, GarmentMeshes, GltfSceneProvider, waitForGltfModelReady } from '@configurator/scene';
import { GLTF_USE_DRACO, GLTF_USE_MESHOPT, isGltfModelReady, resolveModelUrl } from '@configurator/utils';
import { useGLTF } from '@react-three/drei';
import { useConfiguratorProduct } from '@store';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

const GarmentModelLoaded = ({ modelUrl, children }: { modelUrl: string; children?: ReactNode }) => {
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

const GarmentModelGate = ({ modelUrl, children }: { modelUrl: string; children?: ReactNode }) => {
  const [isModelReady, setIsModelReady] = useState(() => isGltfModelReady(modelUrl));

  useEffect(() => {
    if (isGltfModelReady(modelUrl)) return;

    let cancelled = false;

    void waitForGltfModelReady(modelUrl).then(() => {
      if (!cancelled) setIsModelReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [modelUrl]);

  if (!isModelReady) return null;

  return <GarmentModelLoaded modelUrl={modelUrl}>{children}</GarmentModelLoaded>;
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
