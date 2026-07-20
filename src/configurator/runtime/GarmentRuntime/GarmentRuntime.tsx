'use client';

import { useGarmentLogoTextures, useGarmentTextPrintTextures, useSyncGarmentMaterials } from '@configurator/hooks';
// Direct module path, not the '@configurator/runtime' barrel — the barrel re-exports
// this file, and the import cycle leaves bindings undefined in the production build.
import { PrintGizmoLayer } from '@configurator/runtime/PrintGizmoLayer';
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
