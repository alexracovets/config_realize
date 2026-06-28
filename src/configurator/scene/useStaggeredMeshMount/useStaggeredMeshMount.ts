'use client';

import { useState } from 'react';

import { useFrame, useThree } from '@react-three/fiber';

import { useConfiguratorSceneLoad } from '@store';

/** Mount scene nodes one per frame while loaders are active. */
const useStaggeredMeshMount = (totalCount: number, resetKey: string) => {
  const invalidate = useThree((state) => state.invalidate);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);
  const isSceneTransitionLoading = useConfiguratorSceneLoad((state) => state.isSceneTransitionLoading);
  const shouldRevealProgressively = isInitialSceneLoading || isSceneTransitionLoading;

  const session = `${resetKey}:${totalCount}:${shouldRevealProgressively}`;

  const [progress, setProgress] = useState(() => ({
    session: '',
    revealedCount: shouldRevealProgressively ? 0 : totalCount,
  }));

  if (progress.session !== session) {
    setProgress({
      session,
      revealedCount: shouldRevealProgressively ? 0 : totalCount,
    });
  }

  useFrame(() => {
    if (!shouldRevealProgressively) return;

    setProgress((current) => {
      if (current.session !== session) return current;
      if (current.revealedCount >= totalCount) return current;
      return { ...current, revealedCount: current.revealedCount + 1 };
    });
    invalidate();
  });

  const effectiveCount = shouldRevealProgressively ? progress.revealedCount : totalCount;

  return {
    revealedCount: effectiveCount,
    isFullyRevealed: effectiveCount >= totalCount,
  };
};

export { useStaggeredMeshMount };
