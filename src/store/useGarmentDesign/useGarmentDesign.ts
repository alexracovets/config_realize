'use client';

import type { designPatternItemType, garmentConfigType, garmentDesignSnapshotType } from '@types';

import { create } from 'zustand';

import { PALETTE_COLORS } from '../../constants/PALETTE_COLORS/PALETTE_COLORS';

import { resolveDesignCardPreviewSrc, resolveDesignThumbSrc } from '@utils';

const DEFAULT_COLOR = PALETTE_COLORS[1];
const DEFAULT_OPACITY = 1;

interface UseGarmentDesignStore {
  productPath: string | null;
  patterns: designPatternItemType[];
  activePattern: designPatternItemType | null;
  patternColors: Record<string, string>;
  designLayerColors: Record<number, string>;
  activeOpacity: number;
  designOpacity: number;
  defaultPattern: designPatternItemType | null;
  initForProduct: (product: garmentConfigType) => void;
  restoreSnapshot: (product: garmentConfigType, snapshot: garmentDesignSnapshotType) => void;
  setPatterns: (patterns: designPatternItemType[]) => void;
  setActivePattern: (pattern: designPatternItemType | null) => void;
  setPartColor: (partKey: string, color: string) => void;
  getPartColor: (partKey: string) => string;
  setActiveOpacity: (opacity: number) => void;
  setDefaultPattern: (pattern: designPatternItemType | null) => void;
}

const mapProductDesigns = (product: garmentConfigType): designPatternItemType[] =>
  product.patterns.map((pattern, patternIndex) => ({
    key: `pattern-${patternIndex}`,
    name: pattern.name,
    designId: pattern.designId,
    cardPreviewSrc: resolveDesignCardPreviewSrc(pattern.name, pattern.designId),
    parts: pattern.parts.map((part, partIndex) => {
      const src = `${product.path}designs/${part.path_name}`;
      return {
        key: `pattern-${patternIndex}-part-${partIndex}`,
        src,
        previewSrc: resolveDesignThumbSrc(src),
      };
    }),
  }));

const mapDefaultPattern = (product: garmentConfigType): designPatternItemType | null => {
  const pattern = product.default_pattern?.[0];
  if (!pattern) return null;

  return {
    key: 'default-pattern',
    name: pattern.name,
    designId: pattern.designId,
    cardPreviewSrc: '',
    parts: pattern.parts.map((part, partIndex) => {
      const src = `${product.path}designs/${part.path_name}`;
      return {
        key: `default-pattern-part-${partIndex}`,
        src,
        previewSrc: resolveDesignThumbSrc(src),
      };
    }),
  };
};

const buildPatternColors = (pattern: designPatternItemType, layerColors: Record<number, string>): Record<string, string> =>
  Object.fromEntries(pattern.parts.map((part, index) => [part.key, layerColors[index] ?? DEFAULT_COLOR]));

const useGarmentDesign = create<UseGarmentDesignStore>((set, get) => ({
  productPath: null,
  patterns: [],
  activePattern: null,
  patternColors: {},
  designLayerColors: {},
  activeOpacity: DEFAULT_OPACITY,
  designOpacity: DEFAULT_OPACITY,
  defaultPattern: null,

  initForProduct: (product) => {
    set({
      productPath: product.path,
      patterns: mapProductDesigns(product),
      defaultPattern: mapDefaultPattern(product),
      activePattern: null,
      patternColors: {},
      designLayerColors: {},
      activeOpacity: DEFAULT_OPACITY,
      designOpacity: DEFAULT_OPACITY,
    });
  },

  restoreSnapshot: (product, snapshot) => {
    const patterns = mapProductDesigns(product);
    const defaultPattern = mapDefaultPattern(product);
    const activePattern = snapshot.activePatternKey ? (patterns.find((pattern) => pattern.key === snapshot.activePatternKey) ?? null) : null;

    set({
      productPath: product.path,
      patterns,
      defaultPattern,
      activePattern,
      patternColors: snapshot.patternColors,
      designLayerColors: snapshot.designLayerColors,
      activeOpacity: snapshot.activeOpacity,
      designOpacity: snapshot.designOpacity,
    });
  },

  setPatterns: (patterns) => set({ patterns }),

  setActivePattern: (pattern) => {
    if (!pattern) {
      set({ activePattern: null, patternColors: {} });
      return;
    }

    const { designLayerColors, designOpacity } = get();

    set({
      activePattern: pattern,
      patternColors: buildPatternColors(pattern, designLayerColors),
      activeOpacity: designOpacity,
    });
  },

  setPartColor: (partKey, color) => {
    const { activePattern } = get();
    const partIndex = activePattern?.parts.findIndex((part) => part.key === partKey) ?? -1;

    set((state) => ({
      patternColors: {
        ...state.patternColors,
        [partKey]: color,
      },
      designLayerColors:
        partIndex >= 0
          ? {
              ...state.designLayerColors,
              [partIndex]: color,
            }
          : state.designLayerColors,
    }));
  },

  getPartColor: (partKey) => get().patternColors[partKey] ?? DEFAULT_COLOR,

  setActiveOpacity: (opacity) => set({ activeOpacity: opacity, designOpacity: opacity }),

  setDefaultPattern: (pattern) => set({ defaultPattern: pattern }),
}));

export { useGarmentDesign };
