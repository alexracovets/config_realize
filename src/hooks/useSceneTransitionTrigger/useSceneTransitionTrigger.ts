'use client';

import { useEffect, useRef } from 'react';

const useSceneTransitionTrigger = (value: string | null, beginSceneTransitionLoad: () => void, isInitialSceneLoading: boolean) => {
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (isInitialSceneLoading) {
      previousValueRef.current = value;
      return;
    }

    if (previousValueRef.current === value) return;

    previousValueRef.current = value;
    beginSceneTransitionLoad();
  }, [beginSceneTransitionLoad, isInitialSceneLoading, value]);
};

export { useSceneTransitionTrigger };
