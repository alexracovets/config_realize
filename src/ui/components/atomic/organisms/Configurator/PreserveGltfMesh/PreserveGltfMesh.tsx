'use client';

import { memo, useEffect, useMemo } from 'react';

import type { Mesh, Object3D } from 'three';

import type { preserveGltfMeshPropsType } from '@types';

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

/** Push inside shell slightly back in depth — keeps GLTF materials, reduces seam flicker vs outer parts. */
const biasInsideShellDepth = (object: Object3D) => {
  object.traverse((child) => {
    if (!('isMesh' in child) || !child.isMesh) return;

    const mesh = child as Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!material) continue;
      material.polygonOffset = true;
      material.polygonOffsetFactor = 1;
      material.polygonOffsetUnits = 1;
      material.needsUpdate = true;
    }
  });
};

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
