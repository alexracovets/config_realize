import type { Object3D } from 'three';

import type { printablePartMeshesType, printGizmoElementType } from '@types';

interface garmentPartMeshPropsType {
  registryKey: string;
  meshName: string;
  node: Object3D;
  renderOrder?: number;
}

interface preserveGltfMeshPropsType {
  meshName: string;
  node: Object3D;
  renderOrder?: number;
}

interface staticGltfMeshPropsType {
  meshName: string;
  node: Object3D;
  renderOrder?: number;
}

interface printGizmoInstancePropsType {
  element: printGizmoElementType;
  elements: printGizmoElementType[];
  printableParts: printablePartMeshesType[];
  gizmoStep: number | null;
  selectedInstanceId: string | null;
}

export type { garmentPartMeshPropsType, preserveGltfMeshPropsType, printGizmoInstancePropsType, staticGltfMeshPropsType };
