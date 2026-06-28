'use client';

import type { garmentConfigType, garmentNumberSnapshotType, numberInstanceType, numberPositionType, numberPreviewType } from '@types';
import { mapProductNumberPositions } from '@store/useGarmentNumber/mapProductNumbers';
import { create } from 'zustand';
interface GarmentNumberState {
  productPath: string | null;
  positionsKey: string | null;
  positions: numberPositionType[];
  instances: numberInstanceType[];
  preview: numberPreviewType | null;
  selectedInstanceId: string | null;
  initForProduct: (product: garmentConfigType) => void;
  restoreSnapshot: (product: garmentConfigType, snapshot: garmentNumberSnapshotType) => void;
  addInstance: (instance: numberInstanceType) => void;
  removeInstance: (id: string) => void;
  duplicateInstance: (id: string) => void;
  updateInstance: (id: string, patch: Partial<numberInstanceType>) => void;
  setSelectedInstance: (id: string | null) => void;
  clearSelectedInstance: () => void;
  bringInstanceToFront: (id: string) => void;
  setPreview: (instanceId: string, patch: numberPreviewType['patch']) => void;
  clearPreview: () => void;
  getInstancesForRender: () => numberInstanceType[];
}

const resolveNumberInstancesForRender = (instances: numberInstanceType[], preview: numberPreviewType | null): numberInstanceType[] => {
  if (!preview) return instances;

  const { instanceId, patch } = preview;

  if (patch.text !== undefined) {
    const text = patch.text;
    return instances.map((instance) => (instance.id === instanceId ? { ...instance, ...patch } : { ...instance, text }));
  }

  return instances.map((instance) => (instance.id === instanceId ? { ...instance, ...patch } : instance));
};

const buildPositionsKey = (product: garmentConfigType) => JSON.stringify(product.numberPositions ?? []);

const syncNumberInstancesFromPositions = (instances: numberInstanceType[], positions: numberPositionType[]) =>
  instances.map((instance) => {
    const position = positions.find((item) => item.key === instance.positionKey);
    if (!position) return instance;

    return { ...instance, partId: position.partId, uv: position.uv, lineHeight: position.lineHeight ?? instance.lineHeight ?? 1.5 };
  });

const useGarmentNumber = create<GarmentNumberState>((set, get) => ({
  productPath: null,
  positionsKey: null,
  positions: [],
  instances: [],
  preview: null,
  selectedInstanceId: null,
  initForProduct: (product) => {
    const positionsKey = buildPositionsKey(product);
    const positions = mapProductNumberPositions(product);
    const state = get();

    const syncInstancesFromPositions = (instances: numberInstanceType[]) => syncNumberInstancesFromPositions(instances, positions);

    if (state.productPath === product.path && state.positionsKey === positionsKey) {
      set({ positions, instances: syncInstancesFromPositions(state.instances) });
      return;
    }

    set({
      productPath: product.path,
      positionsKey,
      positions,
      instances: [],
      preview: null,
      selectedInstanceId: null,
    });
  },
  restoreSnapshot: (product, snapshot) => {
    const positionsKey = buildPositionsKey(product);
    const positions = mapProductNumberPositions(product);

    set({
      productPath: product.path,
      positionsKey,
      positions,
      instances: syncNumberInstancesFromPositions(snapshot.instances, positions),
      preview: null,
      selectedInstanceId: snapshot.selectedInstanceId ?? null,
    });
  },
  addInstance: (instance) => {
    set((state) => {
      const sharedText = state.instances[0]?.text;
      const nextInstance = sharedText !== undefined ? { ...instance, text: sharedText } : instance;

      return { instances: [...state.instances, nextInstance] };
    });
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

      const copy: numberInstanceType = {
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
    set((state) => {
      if (patch.text !== undefined) {
        const text = patch.text;
        return {
          instances: state.instances.map((instance) => (instance.id === id ? { ...instance, ...patch } : { ...instance, text })),
        };
      }

      return {
        instances: state.instances.map((instance) => (instance.id === id ? { ...instance, ...patch } : instance)),
      };
    });
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
  getInstancesForRender: () => resolveNumberInstancesForRender(get().instances, get().preview),
}));

export { resolveNumberInstancesForRender, useGarmentNumber };
