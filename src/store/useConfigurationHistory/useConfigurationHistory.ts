'use client';

import type { cartItemConfigurationType } from '@types';

import { createSingletonStore } from '@store/createSingletonStore';

const HISTORY_LIMIT = 50;

interface configurationHistoryEntryType {
  configuration: cartItemConfigurationType;
  activeStep: number;
}

interface configurationHistoryStackType {
  past: configurationHistoryEntryType[];
  present: configurationHistoryEntryType;
  future: configurationHistoryEntryType[];
}

interface ConfigurationHistoryState {
  stacks: Record<string, configurationHistoryStackType>;
  activeItemId: string | null;
  setActiveItem: (itemId: string) => void;
  resetItem: (itemId: string, entry: configurationHistoryEntryType) => void;
  removeItem: (itemId: string) => void;
  commit: (itemId: string, entry: configurationHistoryEntryType) => void;
  undo: (itemId: string) => configurationHistoryEntryType | null;
  redo: (itemId: string) => configurationHistoryEntryType | null;
  canUndo: (itemId: string | null) => boolean;
  canRedo: (itemId: string | null) => boolean;
}

const createStack = (entry: configurationHistoryEntryType): configurationHistoryStackType => ({ past: [], present: entry, future: [] });

const useConfigurationHistory = createSingletonStore<ConfigurationHistoryState>('useConfigurationHistory', (set, get) => {
  const replaceStack = (itemId: string, stack: configurationHistoryStackType) => {
    set((state) => ({ stacks: { ...state.stacks, [itemId]: stack } }));
  };

  return {
    stacks: {},
    activeItemId: null,

    setActiveItem: (itemId) => set({ activeItemId: itemId }),

    resetItem: (itemId, entry) => replaceStack(itemId, createStack(entry)),

    removeItem: (itemId) => {
      set((state) => {
        if (!state.stacks[itemId]) return state;
        const stacks = { ...state.stacks };
        delete stacks[itemId];
        return { stacks };
      });
    },

    commit: (itemId, entry) => {
      const stack = get().stacks[itemId];
      if (!stack) {
        replaceStack(itemId, createStack(entry));
        return;
      }

      replaceStack(itemId, { past: [...stack.past, stack.present].slice(-HISTORY_LIMIT), present: entry, future: [] });
    },

    undo: (itemId) => {
      const stack = get().stacks[itemId];
      if (!stack?.past.length) return null;

      const entry = stack.past[stack.past.length - 1];
      replaceStack(itemId, { past: stack.past.slice(0, -1), present: entry, future: [stack.present, ...stack.future] });

      return entry;
    },

    redo: (itemId) => {
      const stack = get().stacks[itemId];
      if (!stack?.future.length) return null;

      const [entry, ...future] = stack.future;
      replaceStack(itemId, { past: [...stack.past, stack.present].slice(-HISTORY_LIMIT), present: entry, future });

      return entry;
    },

    canUndo: (itemId) => Boolean(itemId && get().stacks[itemId]?.past.length),
    canRedo: (itemId) => Boolean(itemId && get().stacks[itemId]?.future.length),
  };
});

export { HISTORY_LIMIT, useConfigurationHistory };
export type { configurationHistoryEntryType };
