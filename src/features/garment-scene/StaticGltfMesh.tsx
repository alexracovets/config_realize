'use client';

import { memo, useEffect, useMemo } from 'react';

import { DEFAULT_COLOR } from '@store';
import type { staticGltfMeshPropsType } from '@types';

import { applyStaticColor, disposeMeshResources, tagGarmentMeshes } from './gltfMeshHelpers';

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
