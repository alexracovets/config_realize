'use client';

import { createSingletonStore } from '@store/createSingletonStore';

interface TutorialDialogState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const useTutorialDialog = createSingletonStore<TutorialDialogState>('useTutorialDialog', (set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export { useTutorialDialog };
