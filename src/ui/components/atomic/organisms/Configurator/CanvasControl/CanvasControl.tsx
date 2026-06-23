'use client';

import { useCartPreviewCapture } from '@hooks';

import { ViewControls } from './ViewControls';

const CanvasControl = () => {
  useCartPreviewCapture();

  return (
    <>
      <ambientLight intensity={1.1} />
      <ViewControls />
    </>
  );
};

export { CanvasControl };
