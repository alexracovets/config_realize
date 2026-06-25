'use client';

import { useMemo, type ReactNode } from 'react';

import { useGLTF } from '@react-three/drei';

import { GarmentMaterialRegistryProvider, PbrMapsProvider } from '@providers';
import { useConfiguratorProduct } from '@store';
import { resolveModelUrl } from '@utils';

import { GarmentMeshes } from './GarmentMeshes';
import { GltfSceneProvider } from './GltfSceneProvider';
import { enrichGltfScene } from './indexGltfSceneNodes';
import { resolveGltfPbrMaps } from './resolveGltfPbrMaps';

const GarmentModel = ({ children }: { children?: ReactNode }) => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);
  const loadedGltf = useGLTF(modelUrl);
  const gltf = useMemo(() => enrichGltfScene(loadedGltf), [loadedGltf]);

  const pbrMaps = useMemo(
    () => resolveGltfPbrMaps(gltf, product.pbrUvChannel ?? 1, modelUrl),
    [gltf, modelUrl, product.pbrUvChannel],
  );

  return (
    <GarmentMaterialRegistryProvider key={modelUrl}>
      <PbrMapsProvider maps={pbrMaps}>
        <GltfSceneProvider gltf={gltf}>
          <GarmentMeshes />
          {children}
        </GltfSceneProvider>
      </PbrMapsProvider>
    </GarmentMaterialRegistryProvider>
  );
};

export { GarmentModel };
