import type { MeshStandardMaterial } from 'three';

const applyGarmentGizmoRotation = (material: MeshStandardMaterial, rotationDeg: number) => {
  const uniform = material.userData.uGizmoRotationUniform as { value: number } | undefined;
  const radians = (rotationDeg * Math.PI) / 180;

  if (uniform) {
    uniform.value = radians;
  }

  material.userData.garmentGizmoRotationDeg = rotationDeg;
};

export { applyGarmentGizmoRotation };
