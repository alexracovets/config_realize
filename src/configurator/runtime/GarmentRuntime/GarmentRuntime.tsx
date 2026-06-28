'use client';

import { useGarmentLogoTextures, useGarmentTextPrintTextures, useSyncGarmentMaterials } from '@configurator/hooks';
import { PrintGizmoLayer } from '@configurator/runtime';
import { memo } from 'react';
/** R3F side-effect runtime: appearance, text/logo textures, print gizmo interaction. */
const GarmentRuntime = memo(() => {
  useSyncGarmentMaterials();
  useGarmentTextPrintTextures();
  useGarmentLogoTextures();

  return <PrintGizmoLayer />;
});

GarmentRuntime.displayName = 'GarmentRuntime';

export { GarmentRuntime };
