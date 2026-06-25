import type { Material, Mesh, Object3D } from 'three';

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

export { applyStaticColor, biasInsideShellDepth, disposeMeshResources, tagGarmentMeshes };
