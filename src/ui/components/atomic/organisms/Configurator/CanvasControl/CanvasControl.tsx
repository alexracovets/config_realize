'use client';

import { useCartPreviewCapture } from '@hooks';

import { ViewControls } from './ViewControls';

const CanvasControl = () => {
  useCartPreviewCapture();

  return (
    <>
      <ambientLight intensity={3} />
      <ViewControls />
    </>
  );
};

export { CanvasControl };
