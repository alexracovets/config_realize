'use client';

let setRestoring: ((value: boolean) => void) | null = null;

const configurationHistoryRestoreGuard = {
  set: (next: (value: boolean) => void) => {
    setRestoring = next;
  },
  clear: () => {
    setRestoring = null;
  },
  run: (work: () => void) => {
    setRestoring?.(true);
    try {
      work();
    } finally {
      setRestoring?.(false);
    }
  },
};

export { configurationHistoryRestoreGuard };
