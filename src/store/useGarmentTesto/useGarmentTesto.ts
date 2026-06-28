'use client';

import type { garmentConfigType, garmentTestoSnapshotType, testoInstanceType, testoPositionType, testoPreviewType } from '@types';
import { mapProductTestoPositions } from '@store/useGarmentTesto/mapProductTesto';
import { create } from 'zustand';
interface GarmentTestoState {
  productPath: string | null;
  positionsKey: string | null;
  positions: testoPositionType[];
  instances: testoInstanceType[];
  preview: testoPreviewType | null;
  selectedInstanceId: string | null;
  initForProduct: (product: garmentConfigType) => void;
  restoreSnapshot: (product: garmentConfigType, snapshot: garmentTestoSnapshotType) => void;
  addInstance: (instance: testoInstanceType) => void;
  removeInstance: (id: string) => void;
  duplicateInstance: (id: string) => void;
  updateInstance: (id: string, patch: Partial<testoInstanceType>) => void;
  setSelectedInstance: (id: string | null) => void;
  clearSelectedInstance: () => void;
  bringInstanceToFront: (id: string) => void;
  setPreview: (instanceId: string, patch: testoPreviewType['patch']) => void;
  clearPreview: () => void;
  getInstancesForRender: () => testoInstanceType[];
}

const resolveTestoInstancesForRender = (instances: testoInstanceType[], preview: testoPreviewType | null): testoInstanceType[] => {
  if (!preview) return instances;

  const { instanceId, patch } = preview;
  return instances.map((instance) => (instance.id === instanceId ? { ...instance, ...patch } : instance));
};

const buildPositionsKey = (product: garmentConfigType) => JSON.stringify(product.testoPositions ?? []);

const syncTestoInstancesFromPositions = (instances: testoInstanceType[], positions: testoPositionType[]) =>
  instances.map((instance) => {
    const position = positions.find((item) => item.key === instance.positionKey);
    if (!position) return instance;

    return {
      ...instance,
      partId: position.partId,
      uv: position.uv,
      lineHeight: position.lineHeight ?? instance.lineHeight ?? 1.5,
      letterSpacing: position.letterSpacing ?? instance.letterSpacing ?? 0,
    };
  });

const useGarmentTesto = create<GarmentTestoState>((set, get) => ({
  productPath: null,
  positionsKey: null,
  positions: [],
  instances: [],
  preview: null,
  selectedInstanceId: null,
  initForProduct: (product) => {
    const positionsKey = buildPositionsKey(product);
    const state = get();

    if (state.productPath === product.path && state.positionsKey === positionsKey) {
      return;
    }

    set({
      productPath: product.path,
      positionsKey,
      positions: mapProductTestoPositions(product),
      instances: [],
      preview: null,
      selectedInstanceId: null,
    });
  },
  restoreSnapshot: (product, snapshot) => {
    const positionsKey = buildPositionsKey(product);

    set({
      productPath: product.path,
      positionsKey,
      positions: mapProductTestoPositions(product),
      instances: syncTestoInstancesFromPositions(snapshot.instances, mapProductTestoPositions(product)),
      preview: null,
      selectedInstanceId: snapshot.selectedInstanceId,
    });
  },
  addInstance: (instance) => {
    set((state) => ({ instances: [...state.instances, instance] }));
  },
  removeInstance: (id) => {
    set((state) => ({
      instances: state.instances.filter((instance) => instance.id !== id),
      preview: state.preview?.instanceId === id ? null : state.preview,
      selectedInstanceId: state.selectedInstanceId === id ? null : state.selectedInstanceId,
    }));
  },
  duplicateInstance: (id) => {
    set((state) => {
      const source = state.instances.find((instance) => instance.id === id);
      if (!source) return state;

      const copy: testoInstanceType = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        uv: { x: source.uv.x, y: Math.min(0.98, source.uv.y + 0.04) },
      };

      return { instances: [...state.instances, copy], selectedInstanceId: copy.id };
    });
  },
  setSelectedInstance: (id) => {
    set({ selectedInstanceId: id });
  },
  clearSelectedInstance: () => {
    set({ selectedInstanceId: null });
  },
  bringInstanceToFront: (id) => {
    set((state) => {
      const index = state.instances.findIndex((instance) => instance.id === id);
      if (index < 0 || index === state.instances.length - 1) return state;

      const next = [...state.instances];
      const [instance] = next.splice(index, 1);
      next.push(instance);

      return { instances: next };
    });
  },
  updateInstance: (id, patch) => {
    set((state) => ({
      instances: state.instances.map((instance) => (instance.id === id ? { ...instance, ...patch } : instance)),
    }));
  },
  setPreview: (instanceId, patch) => {
    set((state) => {
      const currentPatch = state.preview?.instanceId === instanceId ? state.preview.patch : {};

      return { preview: { instanceId, patch: { ...currentPatch, ...patch } } };
    });
  },
  clearPreview: () => {
    set({ preview: null });
  },
  getInstancesForRender: () => resolveTestoInstancesForRender(get().instances, get().preview),
}));

export { resolveTestoInstancesForRender, useGarmentTesto };
