import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { peek } from 'suspend-react';

/** Baked GLBs in /public/models do not use Draco or Meshopt — skip decoder init on first parse. */
const GLTF_USE_DRACO = false;
const GLTF_USE_MESHOPT = false;

const getGltfCacheKeys = (modelUrl: string) => [GLTFLoader, modelUrl] as [typeof GLTFLoader, string];

const readCachedGarmentGltf = (modelUrl: string): GLTF | null => {
  const cached = peek(getGltfCacheKeys(modelUrl)) as GLTF | GLTF[] | undefined;
  if (!cached) return null;
  return Array.isArray(cached) ? (cached[0] ?? null) : cached;
};

const isGltfModelReady = (modelUrl: string): boolean => readCachedGarmentGltf(modelUrl) != null;

const warmGltfModelCache = (modelUrl: string) => {
  useGLTF.preload(modelUrl, GLTF_USE_DRACO, GLTF_USE_MESHOPT);
};

export { GLTF_USE_DRACO, GLTF_USE_MESHOPT, isGltfModelReady, readCachedGarmentGltf, warmGltfModelCache };
