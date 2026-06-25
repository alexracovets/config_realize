'use client';

import { useEffect, useRef } from 'react';

const useSceneTransitionTrigger = (value: string | null, beginSceneTransitionLoad: () => void, isInitialSceneLoading: boolean) => {
  const previousValueRef = useRef(value);
  const initialLoadReleasedRef = useRef(false);

  useEffect(() => {
    if (isInitialSceneLoading) {
      initialLoadReleasedRef.current = false;
      previousValueRef.current = value;
      return;
    }

    // Skip the first effect after initial load — store hydration may still be settling.
    if (!initialLoadReleasedRef.current) {
      initialLoadReleasedRef.current = true;
      previousValueRef.current = value;
      return;
    }

    if (previousValueRef.current === value) return;

    previousValueRef.current = value;
    beginSceneTransitionLoad();
  }, [beginSceneTransitionLoad, isInitialSceneLoading, value]);
};

export { useSceneTransitionTrigger };
