'use client';

import { createContext, type ReactNode, useContext } from 'react';

import type { garmentGltfSceneType } from '@configurator/types';

const GltfSceneContext = createContext<garmentGltfSceneType | null>(null);

const GltfSceneProvider = ({ gltf, children }: { gltf: garmentGltfSceneType; children: ReactNode }) => (
  <GltfSceneContext.Provider value={gltf}>{children}</GltfSceneContext.Provider>
);

const useGltfScene = (): garmentGltfSceneType => {
  const gltf = useContext(GltfSceneContext);
  if (!gltf) throw new Error('useGltfScene must be used within GltfSceneProvider');
  return gltf;
};

export { GltfSceneProvider, useGltfScene };
