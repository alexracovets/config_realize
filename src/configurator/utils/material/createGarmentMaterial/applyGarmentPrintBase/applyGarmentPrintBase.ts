import type { MeshStandardMaterial } from 'three';

const applyGarmentPrintBase = (material: MeshStandardMaterial) => {
  material.map = null;
  material.color.set('#ffffff');

  if (material.aoMap) {
    material.aoMapIntensity = Math.min(material.aoMapIntensity, 0.45);
  }
};

export { applyGarmentPrintBase };
