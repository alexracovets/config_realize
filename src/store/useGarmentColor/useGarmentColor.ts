'use client';

import type { garmentColorSnapshotType, garmentConfigType, partGradientType } from '@types';

import { create } from 'zustand';

import { PALETTE_COLORS } from '@constants';

import { buildDefaultGradients, DISABLED_PART_GRADIENT } from '@configurator/mappers';

const DEFAULT_COLOR = PALETTE_COLORS[0];

interface GarmentColorState {
  byPart: Record<string, string>;
  gradientsByPart: Record<string, partGradientType>;
  initForProduct: (product: garmentConfigType) => void;
  restoreSnapshot: (snapshot: garmentColorSnapshotType) => void;
  setPartColor: (partId: string, color: string) => void;
  getPartColor: (partId: string) => string;
  setPartGradientEnabled: (partId: string, enabled: boolean) => void;
  setPartGradientColor2: (partId: string, color: string) => void;
  setPartGradientRotation: (partId: string, rotation: number) => void;
  setPartGradientPosition: (partId: string, position: number) => void;
  setPartGradientSoftness: (partId: string, softness: number) => void;
  setPartGradientOpacity: (partId: string, opacity: number) => void;
  getPartGradient: (partId: string) => partGradientType;
}

const buildDefaultColors = (product: garmentConfigType): Record<string, string> => Object.fromEntries(product.parts.map((part) => [part.id, DEFAULT_COLOR]));

const getOrCreateGradient = (gradientsByPart: Record<string, partGradientType>, partId: string): partGradientType => {
  return gradientsByPart[partId] ?? DISABLED_PART_GRADIENT;
};

const useGarmentColor = create<GarmentColorState>((set, get) => ({
  byPart: {},
  gradientsByPart: {},

  initForProduct: (product) => {
    set({ byPart: buildDefaultColors(product), gradientsByPart: buildDefaultGradients(product) });
  },

  restoreSnapshot: (snapshot) => {
    set({
      byPart: snapshot.byPart,
      gradientsByPart: snapshot.gradientsByPart,
    });
  },

  setPartColor: (partId, color) => {
    set((state) => ({
      byPart: {
        ...state.byPart,
        [partId]: color,
      },
    }));
  },

  getPartColor: (partId) => get().byPart[partId] ?? DEFAULT_COLOR,

  setPartGradientEnabled: (partId, enabled) => {
    set((state) => {
      const current = getOrCreateGradient(state.gradientsByPart, partId);

      return {
        gradientsByPart: {
          ...state.gradientsByPart,
          [partId]: { ...current, enabled },
        },
      };
    });
  },

  setPartGradientColor2: (partId, color) => {
    set((state) => {
      const current = getOrCreateGradient(state.gradientsByPart, partId);

      return {
        gradientsByPart: {
          ...state.gradientsByPart,
          [partId]: { ...current, color2: color },
        },
      };
    });
  },

  setPartGradientRotation: (partId, rotation) => {
    set((state) => {
      const current = getOrCreateGradient(state.gradientsByPart, partId);

      return {
        gradientsByPart: {
          ...state.gradientsByPart,
          [partId]: { ...current, rotation },
        },
      };
    });
  },

  setPartGradientPosition: (partId, position) => {
    set((state) => {
      const current = getOrCreateGradient(state.gradientsByPart, partId);

      return {
        gradientsByPart: {
          ...state.gradientsByPart,
          [partId]: { ...current, position },
        },
      };
    });
  },

  setPartGradientSoftness: (partId, softness) => {
    set((state) => {
      const current = getOrCreateGradient(state.gradientsByPart, partId);

      return {
        gradientsByPart: {
          ...state.gradientsByPart,
          [partId]: { ...current, softness },
        },
      };
    });
  },

  setPartGradientOpacity: (partId, opacity) => {
    set((state) => {
      const current = getOrCreateGradient(state.gradientsByPart, partId);

      return {
        gradientsByPart: {
          ...state.gradientsByPart,
          [partId]: { ...current, opacity },
        },
      };
    });
  },

  getPartGradient: (partId) => getOrCreateGradient(get().gradientsByPart, partId),
}));

export { useGarmentColor, DEFAULT_COLOR };
