'use client';

import { ViewControls } from '@configurator/canvas';
import { useCartPreviewCapture } from '@configurator/hooks';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useConfiguratorSceneLoad } from '@store';
import { useEffect } from 'react';

const CanvasControl = () => {
  useCartPreviewCapture();
  const invalidate = useThree((state) => state.invalidate);
  const isInitialSceneLoading = useConfiguratorSceneLoad((state) => state.isInitialSceneLoading);

  useEffect(() => {
    if (isInitialSceneLoading) return;

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

    const retryId = window.setTimeout(() => invalidate(), 500);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(retryId);
    };
  }, [invalidate, isInitialSceneLoading]);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 4, 3]} intensity={0.1} />
      <directionalLight position={[-2, 1, -1]} intensity={0.1} />
      <ViewControls />
      <Environment preset="studio" environmentIntensity={0.2} background={false} />
    </>
  );
};

export { CanvasControl };
