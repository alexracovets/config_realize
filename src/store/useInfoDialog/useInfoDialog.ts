'use client';

import { create } from 'zustand';

interface InfoDialogState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const useInfoDialog = create<InfoDialogState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export { useInfoDialog };
