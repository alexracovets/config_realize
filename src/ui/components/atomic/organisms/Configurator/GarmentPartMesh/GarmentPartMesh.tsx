'use client';

import { memo, useEffect, useLayoutEffect, useMemo } from 'react';
import type { Mesh, MeshStandardMaterial } from 'three';

import { useGarmentMaterialRegistry, usePbrMaps } from '@providers';
import { useConfiguratorProduct } from '@store';
import type { garmentPartMeshPropsType } from '@types';
import { createGarmentMaterial } from '../../../../../../utils/createGarmentMaterial';

const GarmentPartMesh = memo(({ registryKey, meshName, node, renderOrder = 0 }: garmentPartMeshPropsType) => {
  const pbrMaps = usePbrMaps();
  const pbrUvChannel = useConfiguratorProduct((state) => state.product.pbrUvChannel ?? 1);
  const { register, unregister } = useGarmentMaterialRegistry();

  const source = node as Mesh;
  const sourceMaterialList = 'isMesh' in source && source.isMesh ? source.material : null;

  const isRenderable = 'isMesh' in source && source.isMesh && !!source.geometry;
  const materials = useMemo(() => {
    const sources = Array.isArray(sourceMaterialList) ? sourceMaterialList : sourceMaterialList ? [sourceMaterialList] : [];

    return sources.length > 0
      ? sources.map((sourceMaterial) => createGarmentMaterial(pbrMaps, sourceMaterial as MeshStandardMaterial, pbrUvChannel))
      : [createGarmentMaterial(pbrMaps, null, pbrUvChannel)];
  }, [pbrMaps, pbrUvChannel, sourceMaterialList]);
  const meshMaterial = materials.length === 1 ? materials[0] : materials;

  useLayoutEffect(() => {
    if (!isRenderable) return;

    for (const material of materials) {
      register(registryKey, material);
    }

    return () => {
      for (const material of materials) {
        unregister(registryKey, material);
      }
    };
  }, [isRenderable, materials, registryKey, register, unregister]);

  useEffect(() => {
    if (!isRenderable) return;

    return () => {
      for (const material of materials) {
        material.dispose();
      }
    };
  }, [isRenderable, materials]);

  if (!isRenderable) return null;

  return (
    <mesh
      name={meshName}
      geometry={source.geometry}
      material={meshMaterial}
      position={source.position}
      quaternion={source.quaternion}
      scale={source.scale}
      renderOrder={renderOrder}
      userData={{ configuratorGarment: true }}
    />
  );
});

GarmentPartMesh.displayName = 'GarmentPartMesh';

export { GarmentPartMesh };
