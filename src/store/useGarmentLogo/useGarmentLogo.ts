'use client';

import type { garmentConfigType, garmentLogoSnapshotType, logoInstanceType, logoPositionType, logoPreviewType } from '@types';
import { LOGO_MAX_USER_FILES, LOGO_SHADER_SLOT_COUNT, LOGO_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import { createDefaultLogoInstances, createDynamicUserLogoPosition, createLogoInstance, mapProductLogoPositions } from '@store/useGarmentLogo/mapProductLogos';
import { createSingletonStore } from '@store/createSingletonStore';
import { randomId } from '@utils';
interface GarmentLogoState {
  productPath: string | null;
  positionsKey: string | null;
  positions: logoPositionType[];
  instances: logoInstanceType[];
  preview: logoPreviewType | null;
  selectedInstanceId: string | null;
  initForProduct: (product: garmentConfigType) => void;
  restoreSnapshot: (product: garmentConfigType, snapshot: garmentLogoSnapshotType) => void;
  addUserInstance: (position: logoPositionType, src: string, fileName: string, naturalWidth: number, naturalHeight: number) => void;
  addFreeUserInstance: (product: garmentConfigType, src: string, fileName: string, naturalWidth: number, naturalHeight: number) => void;
  replaceInstanceImage: (id: string, src: string, fileName: string, naturalWidth: number, naturalHeight: number) => void;
  removeInstance: (id: string) => void;
  duplicateInstance: (id: string) => void;
  setSelectedInstance: (id: string) => void;
  clearSelectedInstance: () => void;
  bringInstanceToFront: (id: string) => void;
  updateInstance: (id: string, patch: Partial<logoInstanceType>) => void;
  setPreview: (instanceId: string, patch: logoPreviewType['patch']) => void;
  clearPreview: () => void;
  canAddUserLogo: () => boolean;
  getInstancesForRender: () => logoInstanceType[];
}

const resolveLogoInstancesForRender = (instances: logoInstanceType[], preview: logoPreviewType | null): logoInstanceType[] => {
  const renderable = instances.filter((instance) => instance.src.trim());
  if (!preview) return renderable;

  return renderable.map((instance) => (instance.id === preview.instanceId ? { ...instance, ...preview.patch } : instance));
};

const resolveCanAddUserLogo = (instances: logoInstanceType[]): boolean => {
  const userCount = instances.filter((instance) => !instance.isDefault).length;
  const stampCount = instances.filter((instance) => instance.src.trim()).length;

  return userCount < LOGO_MAX_USER_FILES && stampCount < LOGO_SHADER_SLOT_COUNT;
};

const buildPositionsKey = (product: garmentConfigType) => JSON.stringify(product.logoPositions ?? []);

const syncInstancesFromPositions = (instances: logoInstanceType[], positions: logoPositionType[]) =>
  instances.map((instance) => {
    const position = positions.find((item) => item.key === instance.positionKey);
    if (!position) return instance;

    return {
      ...instance,
      partId: position.partId,
      uv: position.uv,
      showFrame: position.showFrame,
      showGizmo: position.showGizmo,
    };
  });

const useGarmentLogo = createSingletonStore<GarmentLogoState>('useGarmentLogo', (set, get) => ({
  productPath: null,
  positionsKey: null,
  positions: [],
  instances: [],
  preview: null,
  selectedInstanceId: null,
  initForProduct: (product) => {
    const positionsKey = buildPositionsKey(product);
    const positions = mapProductLogoPositions(product);
    const state = get();

    if (state.productPath === product.path && state.positionsKey === positionsKey) {
      set({ positions, instances: syncInstancesFromPositions(state.instances, positions) });
      return;
    }

    set({
      productPath: product.path,
      positionsKey,
      positions,
      instances: createDefaultLogoInstances(positions),
      preview: null,
      selectedInstanceId: null,
    });
  },
  restoreSnapshot: (product, snapshot) => {
    const positionsKey = buildPositionsKey(product);
    const positions = mapProductLogoPositions(product);

    set({
      productPath: product.path,
      positionsKey,
      positions,
      instances: snapshot.instances,
      preview: null,
      selectedInstanceId: snapshot.selectedInstanceId,
    });
  },
  addUserInstance: (position, src, fileName, naturalWidth, naturalHeight) => {
    if (!get().canAddUserLogo()) return;

    const instance = createLogoInstance(position, `${position.key}_user_${randomId()}`, {
      src,
      fileName,
      isDefault: false,
      naturalWidth,
      naturalHeight,
      uploadRotation: LOGO_UPLOAD_ROTATION_DEG,
    });

    set((state) => ({ instances: [...state.instances, instance], selectedInstanceId: instance.id }));
  },
  addFreeUserInstance: (product, src, fileName, naturalWidth, naturalHeight) => {
    if (!get().canAddUserLogo()) return;

    const { instances } = get();
    const userInstances = instances.filter((instance) => !instance.isDefault);
    const usedSlots = new Set(userInstances.map((instance) => instance.positionKey));

    let freeSlot = 0;
    while (usedSlots.has(`logo-user-${freeSlot}`)) freeSlot += 1;

    const position = createDynamicUserLogoPosition(product, freeSlot);
    const instance = createLogoInstance(position, `${position.key}_${randomId()}`, {
      src,
      fileName,
      isDefault: false,
      naturalWidth,
      naturalHeight,
      uploadRotation: LOGO_UPLOAD_ROTATION_DEG,
    });

    set((state) => ({ instances: [...state.instances, instance], selectedInstanceId: instance.id }));
  },
  replaceInstanceImage: (id, src, fileName, naturalWidth, naturalHeight) => {
    set((state) => ({
      instances: state.instances.map((instance) =>
        instance.id === id
          ? {
              ...instance,
              src,
              fileName,
              naturalWidth,
              naturalHeight,
            }
          : instance,
      ),
      preview: state.preview?.instanceId === id ? null : state.preview,
    }));
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
      if (!resolveCanAddUserLogo(state.instances)) return state;

      const source = state.instances.find((instance) => instance.id === id);
      if (!source) return state;

      const copy: logoInstanceType = {
        ...source,
        id: `${source.id}-copy-${randomId()}`,
        uv: { x: source.uv.x, y: Math.min(0.98, source.uv.y + 0.04) },
        isDefault: false,
        showFrame: true,
        showGizmo: true,
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
  canAddUserLogo: () => resolveCanAddUserLogo(get().instances),
  getInstancesForRender: () => resolveLogoInstancesForRender(get().instances, get().preview),
}));

export { resolveCanAddUserLogo, resolveLogoInstancesForRender, useGarmentLogo };
