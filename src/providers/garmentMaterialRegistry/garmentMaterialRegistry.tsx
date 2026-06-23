'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from 'react';

import type { garmentMaterialRegistryValueType } from '@types';
import type { MeshStandardMaterial } from 'three';

const GarmentMaterialRegistryContext = createContext<garmentMaterialRegistryValueType | null>(null);

const GarmentMaterialRegistryProvider = ({ children }: { children: React.ReactNode }) => {
  const materialsRef = useRef<Map<string, Set<MeshStandardMaterial>>>(new Map());
  const revisionRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());

  const notifyMaterials = useCallback(() => {
    revisionRef.current += 1;
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const register = useCallback(
    (key: string, material: MeshStandardMaterial) => {
      const bucket = materialsRef.current.get(key) ?? new Set<MeshStandardMaterial>();
      bucket.add(material);
      materialsRef.current.set(key, bucket);
      notifyMaterials();
    },
    [notifyMaterials],
  );

  const unregister = useCallback(
    (key: string, material: MeshStandardMaterial) => {
      const bucket = materialsRef.current.get(key);
      if (!bucket) return;

      bucket.delete(material);
      if (bucket.size === 0) materialsRef.current.delete(key);
      notifyMaterials();
    },
    [notifyMaterials],
  );

  const getMaterials = useCallback((key: string) => {
    return Array.from(materialsRef.current.get(key) ?? []);
  }, []);

  const hasMaterialsForParts = useCallback((partIds: readonly string[]) => {
    return partIds.every((partId) => (materialsRef.current.get(partId)?.size ?? 0) > 0);
  }, []);

  const subscribeMaterials = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getRevision = useCallback(() => revisionRef.current, []);

  const bumpRevision = useCallback(() => {
    notifyMaterials();
  }, [notifyMaterials]);

  const value = useMemo(
    () => ({
      register,
      unregister,
      getMaterials,
      hasMaterialsForParts,
      subscribeMaterials,
      getRevision,
      bumpRevision,
    }),
    [bumpRevision, getMaterials, getRevision, hasMaterialsForParts, register, subscribeMaterials, unregister],
  );

  return <GarmentMaterialRegistryContext.Provider value={value}>{children}</GarmentMaterialRegistryContext.Provider>;
};

const useGarmentMaterialRegistry = (): garmentMaterialRegistryValueType => {
  const context = useContext(GarmentMaterialRegistryContext);
  if (!context) throw new Error('useGarmentMaterialRegistry must be used within GarmentMaterialRegistryProvider');
  return context;
};

const useMaterialRegistryRevision = (): number => {
  const { subscribeMaterials, getRevision } = useGarmentMaterialRegistry();
  return useSyncExternalStore(subscribeMaterials, getRevision, getRevision);
};

const useGarmentSceneReady = (partIds: readonly string[]): boolean => {
  const { hasMaterialsForParts, subscribeMaterials, getRevision } = useGarmentMaterialRegistry();
  useSyncExternalStore(subscribeMaterials, getRevision, getRevision);

  return hasMaterialsForParts(partIds);
};

export { GarmentMaterialRegistryProvider, useGarmentMaterialRegistry, useGarmentSceneReady, useMaterialRegistryRevision };
