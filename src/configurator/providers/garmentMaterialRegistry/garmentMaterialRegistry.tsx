'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import type { garmentMaterialRegistryValueType } from '@configurator/types';
import type { MeshStandardMaterial } from 'three';

// This module is reachable through two different specifiers ('@configurator' via the
// bootstrap/canvas barrels, and '@configurator/providers' from the scene tree). The
// production bundler instantiates it once per entry point, which yields two distinct
// createContext objects: the provider writes to one, consumers read the other, and the
// consumer throws. Pinning the context on globalThis keeps every copy on one instance.
const GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY = Symbol.for('configurator.garmentMaterialRegistryContext');

type registryContextGlobalType = typeof globalThis & {
  [GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY]?: React.Context<garmentMaterialRegistryValueType | null>;
};

const registryContextGlobal = globalThis as registryContextGlobalType;

const GarmentMaterialRegistryContext =
  registryContextGlobal[GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY] ??
  (registryContextGlobal[GARMENT_MATERIAL_REGISTRY_CONTEXT_KEY] = createContext<garmentMaterialRegistryValueType | null>(null));

// Temporary diagnostics. Keep until the fix is confirmed on prod.
// contextId is per module copy; sharedContext tells whether this copy reused the global one.
const garmentMaterialRegistryContextId = Math.random().toString(36).slice(2, 8);
let registryProviderMountCount = 0;

const GarmentMaterialRegistryProvider = ({ children }: { children: React.ReactNode }) => {
  // Temporary diagnostics: a render logged without a following mount means the
  // provider rendered but never committed (e.g. its subtree suspended).
  console.info('[registry-provider-render]', { contextId: garmentMaterialRegistryContextId });

  const materialsRef = useRef<Map<string, Set<MeshStandardMaterial>>>(new Map());
  const revisionRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());
  const notifyFrameRef = useRef<number | null>(null);

  const notifyMaterials = useCallback(() => {
    revisionRef.current += 1;
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const scheduleNotifyMaterials = useCallback(() => {
    if (notifyFrameRef.current != null) return;

    notifyFrameRef.current = requestAnimationFrame(() => {
      notifyFrameRef.current = null;
      notifyMaterials();
    });
  }, [notifyMaterials]);

  const register = useCallback(
    (key: string, material: MeshStandardMaterial) => {
      const bucket = materialsRef.current.get(key) ?? new Set<MeshStandardMaterial>();
      bucket.add(material);
      materialsRef.current.set(key, bucket);
      scheduleNotifyMaterials();
    },
    [scheduleNotifyMaterials],
  );

  const unregister = useCallback(
    (key: string, material: MeshStandardMaterial) => {
      const bucket = materialsRef.current.get(key);
      if (!bucket) return;

      bucket.delete(material);
      if (bucket.size === 0) materialsRef.current.delete(key);
      scheduleNotifyMaterials();
    },
    [scheduleNotifyMaterials],
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

  // Temporary diagnostics.
  useEffect(() => {
    registryProviderMountCount += 1;
    console.info('[registry-provider-mounted]', {
      mounts: registryProviderMountCount,
      contextId: garmentMaterialRegistryContextId,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (notifyFrameRef.current != null) {
        cancelAnimationFrame(notifyFrameRef.current);
      }
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
  if (!context) {
    // Temporary diagnostics. Keep until the fix is confirmed on prod.
    console.error('[registry-miss]', {
      providerMounts: registryProviderMountCount,
      contextId: garmentMaterialRegistryContextId,
      stack: new Error().stack,
    });
    throw new Error('useGarmentMaterialRegistry must be used within GarmentMaterialRegistryProvider');
  }
  return context;
};

const useMaterialRegistryRevision = (): number => {
  const { subscribeMaterials, getRevision } = useGarmentMaterialRegistry();
  return useSyncExternalStore(subscribeMaterials, getRevision, getRevision);
};

export { GarmentMaterialRegistryProvider, useGarmentMaterialRegistry, useMaterialRegistryRevision };
