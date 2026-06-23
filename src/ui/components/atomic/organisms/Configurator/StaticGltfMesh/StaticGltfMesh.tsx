'use client';

import { memo, useEffect, useMemo } from 'react';

import type { Material, Mesh, Object3D } from 'three';

import { DEFAULT_COLOR } from '@store';
import type { staticGltfMeshPropsType } from '@types';

const disposeMeshResources = (object: Object3D) => {
  object.traverse((child) => {
    if (!('isMesh' in child) || !child.isMesh) return;

    const mesh = child as Mesh;
    mesh.geometry?.dispose();

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      material?.dispose();
    }
  });
};

const tagGarmentMeshes = (object: Object3D) => {
  object.traverse((child) => {
    if ('isMesh' in child && child.isMesh) child.userData.configuratorGarment = true;
  });
};

const applyStaticColor = (object: Object3D, color: string) => {
  object.traverse((child) => {
    if (!('isMesh' in child) || !child.isMesh) return;

    const mesh = child as Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material && 'color' in material) {
        (material as Material & { color: { set: (value: string) => void } }).color.set(color);
      }
    }
  });
};

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
