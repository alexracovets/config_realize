'use client';

import { create } from 'zustand';

interface TutorialDialogState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const useTutorialDialog = create<TutorialDialogState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export { useTutorialDialog };
