'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/** Demand frameloop does not render after Suspense resolves — pump invalidates once the scene graph mounts. */
const SceneFrameSync = () => {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();

    let frame = 0;
    let rafId = 0;
    const pump = () => {
      invalidate();
      frame += 1;
      if (frame < 6) {
        rafId = requestAnimationFrame(pump);
      }
    };
    rafId = requestAnimationFrame(pump);

    return () => cancelAnimationFrame(rafId);
  }, [invalidate]);

  return null;
};

export { SceneFrameSync };
