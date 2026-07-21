'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

import type { garmentMaterialRegistryValueType } from '@configurator/types';
import type { MeshStandardMaterial } from 'three';

// This module is reachable through multiple chunk entry points. The production bundler can
// evaluate it more than once, which would otherwise yield distinct createContext objects and
// separate materials Maps: the provider writes to one copy, consumers read another, and sync
// (colors / patterns / logos / text) silently targets an empty registry while the on-screen
// meshes stay on the default white material. Pinning both the React context and the mutable
// store on globalThis keeps every module copy on one instance.
const GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY = Symbol.for('configurator.garmentMaterialRegistryContext');
const GARMENT_MATERIAL_REGISTRY_STORE_KEY = Symbol.for('configurator.garmentMaterialRegistryStore');

type registryStoreType = {
  materials: Map<string, Set<MeshStandardMaterial>>;
  revision: number;
  listeners: Set<() => void>;
  notifyFrame: number | null;
};

type registryContextGlobalType = typeof globalThis & {
  [GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY]?: React.Context<garmentMaterialRegistryValueType | null>;
  [GARMENT_MATERIAL_REGISTRY_STORE_KEY]?: registryStoreType;
};

const registryGlobal = globalThis as registryContextGlobalType;

const GarmentMaterialRegistryContext =
  registryGlobal[GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY] ??
  (registryGlobal[GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY] = createContext<garmentMaterialRegistryValueType | null>(null));

const getRegistryStore = (): registryStoreType =>
  (registryGlobal[GARMENT_MATERIAL_REGISTRY_STORE_KEY] ??= {
    materials: new Map<string, Set<MeshStandardMaterial>>(),
    revision: 0,
    listeners: new Set<() => void>(),
    notifyFrame: null,
  });

const GarmentMaterialRegistryProvider = ({ children }: { children: React.ReactNode }) => {
  const notifyMaterials = useCallback(() => {
    const store = getRegistryStore();
    store.revision += 1;
    store.listeners.forEach((listener) => listener());
  }, []);

  const scheduleNotifyMaterials = useCallback(() => {
    const store = getRegistryStore();
    if (store.notifyFrame != null) return;

    store.notifyFrame = requestAnimationFrame(() => {
      store.notifyFrame = null;
      notifyMaterials();
    });
  }, [notifyMaterials]);

  const register = useCallback(
    (key: string, material: MeshStandardMaterial) => {
      const store = getRegistryStore();
      const bucket = store.materials.get(key) ?? new Set<MeshStandardMaterial>();
      bucket.add(material);
      store.materials.set(key, bucket);
      scheduleNotifyMaterials();
    },
    [scheduleNotifyMaterials],
  );

  const unregister = useCallback(
    (key: string, material: MeshStandardMaterial) => {
      const store = getRegistryStore();
      const bucket = store.materials.get(key);
      if (!bucket) return;

      bucket.delete(material);
      if (bucket.size === 0) store.materials.delete(key);
      scheduleNotifyMaterials();
    },
    [scheduleNotifyMaterials],
  );

  const getMaterials = useCallback((key: string) => {
    return Array.from(getRegistryStore().materials.get(key) ?? []);
  }, []);

  const hasMaterialsForParts = useCallback((partIds: readonly string[]) => {
    const store = getRegistryStore();
    return partIds.every((partId) => (store.materials.get(partId)?.size ?? 0) > 0);
  }, []);

  const subscribeMaterials = useCallback((listener: () => void) => {
    const store = getRegistryStore();
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, []);

  const getRevision = useCallback(() => getRegistryStore().revision, []);

  const bumpRevision = useCallback(() => {
    notifyMaterials();
  }, [notifyMaterials]);

  useEffect(() => {
    return () => {
      const store = getRegistryStore();
      if (store.notifyFrame != null) {
        cancelAnimationFrame(store.notifyFrame);
        store.notifyFrame = null;
      }
      // Provider is keyed by modelUrl — drop the shared bucket so the next garment
      // does not inherit stale part materials from a previous module copy / model.
      store.materials.clear();
      store.revision += 1;
      store.listeners.forEach((listener) => listener());
    };
  }, []);

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

export { GarmentMaterialRegistryProvider, useGarmentMaterialRegistry, useMaterialRegistryRevision };
