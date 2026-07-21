import type { MeshStandardMaterial } from 'three';

const detachGarmentMaterialMaps = (material: MeshStandardMaterial) => {
  material.map = null;
  material.normalMap = null;
  material.roughnessMap = null;
  material.metalnessMap = null;
  material.aoMap = null;
  material.emissiveMap = null;
  material.alphaMap = null;
  material.lightMap = null;
  material.bumpMap = null;
  material.displacementMap = null;
};

const disposeGarmentMaterial = (material: MeshStandardMaterial) => {
  detachGarmentMaterialMaps(material);
  material.dispose();
};

export { disposeGarmentMaterial };
