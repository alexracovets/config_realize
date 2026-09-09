'use client';

import { createSingletonStore } from '@store/createSingletonStore';

const SCROLL_HINT_STORAGE_KEY = 'realize:scroll-hint-seen';

const readWasSeen = (): boolean => {
  try {
    return window.localStorage.getItem(SCROLL_HINT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const persistWasSeen = (): void => {
  try {
    window.localStorage.setItem(SCROLL_HINT_STORAGE_KEY, '1');
  } catch {
    return;
  }
};

interface ScrollHintTutorialState {
  isOpen: boolean;
  wasSeen: boolean;
  targetElement: HTMLElement | null;
  setTargetElement: (element: HTMLElement | null) => void;
  openHint: () => void;
  dismissHint: () => void;
}

const useScrollHintTutorial = createSingletonStore<ScrollHintTutorialState>('useScrollHintTutorial', (set, get) => ({
  isOpen: false,
  wasSeen: false,
  targetElement: null,
  setTargetElement: (targetElement) => set({ targetElement }),
  openHint: () => {
    const { isOpen, wasSeen } = get();
    if (isOpen || wasSeen) return;

    if (readWasSeen()) {
      set({ wasSeen: true });
      return;
    }

    set({ isOpen: true });
  },
  dismissHint: () => {
    if (!get().isOpen) return;

    persistWasSeen();
    set({ isOpen: false, wasSeen: true });
  },
}));

export { useScrollHintTutorial };
