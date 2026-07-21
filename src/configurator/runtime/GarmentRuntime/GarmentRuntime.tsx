'use client';

import { useGarmentLogoTextures, useGarmentTextPrintTextures, useSyncGarmentMaterials } from '@configurator/hooks';

import { PrintGizmoLayer } from '@configurator/runtime/PrintGizmoLayer';
import { memo } from 'react';

const GarmentRuntime = memo(() => {
  useSyncGarmentMaterials();
  useGarmentTextPrintTextures();
  useGarmentLogoTextures();

  return <PrintGizmoLayer />;
});

GarmentRuntime.displayName = 'GarmentRuntime';

export { GarmentRuntime };
