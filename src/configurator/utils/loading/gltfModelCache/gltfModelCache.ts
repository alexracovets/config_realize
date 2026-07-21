import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { peek } from 'suspend-react';

const GLTF_USE_DRACO = false;
const GLTF_USE_MESHOPT = false;

const scheduleGarmentGltfParse = (work: () => void) => {
  if (typeof window === 'undefined') {
    work();
    return;
  }

  const scheduler = globalThis as typeof globalThis & {
    scheduler?: { postTask: (callback: () => void, options?: { priority?: string }) => void };
  };

  if (scheduler.scheduler?.postTask) {
    scheduler.scheduler.postTask(work, { priority: 'background' });
    return;
  }

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(work, { timeout: 1_500 });
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(work);
  });
};

const getGltfCacheKeys = (modelUrl: string) => [GLTFLoader, modelUrl] as [typeof GLTFLoader, string];

const readCachedGarmentGltf = (modelUrl: string): GLTF | null => {
  const cached = peek(getGltfCacheKeys(modelUrl)) as GLTF | GLTF[] | undefined;
  if (!cached) return null;
  return Array.isArray(cached) ? (cached[0] ?? null) : cached;
};

const isGltfModelReady = (modelUrl: string): boolean => readCachedGarmentGltf(modelUrl) != null;

const startGarmentGltfPreload = (modelUrl: string) => {
  useGLTF.preload(modelUrl, GLTF_USE_DRACO, GLTF_USE_MESHOPT);
};

const warmGltfModelCache = (modelUrl: string) => {
  if (isGltfModelReady(modelUrl)) return;

  scheduleGarmentGltfParse(() => {
    startGarmentGltfPreload(modelUrl);
  });
};

const preloadGarmentGltfEager = (modelUrl: string) => {
  if (isGltfModelReady(modelUrl)) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      startGarmentGltfPreload(modelUrl);
    });
  });
};

export { GLTF_USE_DRACO, GLTF_USE_MESHOPT, isGltfModelReady, preloadGarmentGltfEager, readCachedGarmentGltf, warmGltfModelCache };
