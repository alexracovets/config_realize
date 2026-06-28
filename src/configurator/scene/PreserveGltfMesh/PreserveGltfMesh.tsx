'use client';

import type { preserveGltfMeshPropsType } from '@configurator/types';
import { biasInsideShellDepth, disposeMeshResources, tagGarmentMeshes } from '@configurator/scene';
import { memo, useEffect, useMemo } from 'react';
const PreserveGltfMesh = memo(({ meshName, node, renderOrder = 0 }: preserveGltfMeshPropsType) => {
  const instance = useMemo(() => {
    const clone = node.clone(true);
    if (meshName.toLowerCase().includes('inside')) {
      biasInsideShellDepth(clone);
    }
    tagGarmentMeshes(clone);
    return clone;
  }, [meshName, node]);

  useEffect(() => {
    return () => disposeMeshResources(instance);
  }, [instance]);

  return <primitive name={meshName} object={instance} renderOrder={renderOrder} />;
});

PreserveGltfMesh.displayName = 'PreserveGltfMesh';

export { PreserveGltfMesh };
