import type { MeshStandardMaterial } from 'three';

/** Clone GLTF material for configurator: white fabric color, no albedo map — keep native PBR maps. */
const applyGarmentPrintBase = (material: MeshStandardMaterial) => {
  material.map = null;
  material.color.set('#ffffff');

  if (material.aoMap) {
    material.aoMapIntensity = Math.min(material.aoMapIntensity, 0.45);
  }
};

export { applyGarmentPrintBase };
