'use client';

import { createSingletonStore } from '@store/createSingletonStore';

interface InfoDialogState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const useInfoDialog = createSingletonStore<InfoDialogState>('useInfoDialog', (set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export { useInfoDialog };
