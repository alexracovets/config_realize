'use client';

import type { staticGltfMeshPropsType } from '@configurator/types';
import { applyStaticColor, disposeMeshResources, tagGarmentMeshes } from '@configurator/scene';
import { DEFAULT_COLOR } from '@store';
import { memo, useEffect, useMemo } from 'react';
const StaticGltfMesh = memo(({ meshName, node, renderOrder = 0 }: staticGltfMeshPropsType) => {
  const instance = useMemo(() => {
    const clone = node.clone(true);
    applyStaticColor(clone, DEFAULT_COLOR);
    tagGarmentMeshes(clone);
    return clone;
  }, [node]);

  useEffect(() => {
    return () => disposeMeshResources(instance);
  }, [instance]);

  return <primitive name={meshName} object={instance} renderOrder={renderOrder} />;
});

StaticGltfMesh.displayName = 'StaticGltfMesh';

export { StaticGltfMesh };
