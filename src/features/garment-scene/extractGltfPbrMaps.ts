import { Mesh, MeshStandardMaterial, NoColorSpace, type Texture } from 'three';
import type { GLTF } from 'three-stdlib';

import type { garmentPbrUvChannelType, pbrMapsType } from '@types';

const cloneGltfTexture = (source: Texture, channel: garmentPbrUvChannelType): Texture => {
  const tex = source.clone();
  tex.channel = channel;
  tex.flipY = false;
  tex.colorSpace = NoColorSpace;
  tex.needsUpdate = true;
  return tex;
};

const isGarmentPbrMaterial = (material: unknown): material is MeshStandardMaterial => {
  if (!material || typeof material !== 'object') return false;
  if (!('isMeshStandardMaterial' in material) || !(material as MeshStandardMaterial).isMeshStandardMaterial) return false;

  const standard = material as MeshStandardMaterial;
  return Boolean(standard.normalMap && (standard.aoMap || standard.roughnessMap));
};

const findGarmentPbrMaterial = (gltf: GLTF): MeshStandardMaterial | null => {
  let found: MeshStandardMaterial | null = null;

  gltf.scene.traverse((child) => {
    if (found || !(child instanceof Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (isGarmentPbrMaterial(material)) {
        found = material;
        return;
      }
    }
  });

  return found;
};

const extractGltfPbrMaps = (gltf: GLTF, pbrUvChannel: garmentPbrUvChannelType = 1): pbrMapsType | null => {
  const material = findGarmentPbrMaterial(gltf);
  if (!material?.normalMap) return null;

  const bakeAoRoughness = material.aoMap ?? material.roughnessMap;
  if (!bakeAoRoughness) return null;

  return {
    bakeNormal: cloneGltfTexture(material.normalMap, pbrUvChannel),
    bakeAoRoughness: cloneGltfTexture(bakeAoRoughness, pbrUvChannel),
  };
};

export { extractGltfPbrMaps };
