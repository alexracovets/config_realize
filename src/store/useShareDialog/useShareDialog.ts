'use client';

import { createSingletonStore } from '@store/createSingletonStore';

type shareDialogStatusType = 'idle' | 'pending' | 'ready' | 'error';

interface ShareDialogState {
  isOpen: boolean;
  status: shareDialogStatusType;
  shareUrl: string | null;

  setIsOpen: (isOpen: boolean) => void;
  openPending: () => void;
  resolveShareUrl: (shareUrl: string) => void;
  failShare: () => void;
}

const useShareDialog = createSingletonStore<ShareDialogState>('useShareDialog', (set) => ({
  isOpen: false,
  status: 'idle',
  shareUrl: null,

  setIsOpen: (isOpen) => set(isOpen ? { isOpen } : { isOpen, status: 'idle', shareUrl: null }),

  openPending: () => set({ isOpen: true, status: 'pending', shareUrl: null }),

  resolveShareUrl: (shareUrl) => set({ status: 'ready', shareUrl }),

  failShare: () => set({ status: 'error', shareUrl: null }),
}));

export { useShareDialog };
export type { shareDialogStatusType };
