import type { Camera, Raycaster, Scene } from 'three';

import type { printGizmoElementType, uvBoundsType, uvPointType } from '@types';

interface gizmoButtonHoverTargetType {
  slotIndex: number;
  cornerIndex: number;
}

interface gizmoButtonHitType {
  slotIndex: number;
  cornerIndex: number;
}

interface printablePartMeshesType {
  partId: string;
  meshNames: string[];
  printRotation: number;
  uvBounds: uvBoundsType;
}

interface printUvHitType {
  uv: uvPointType;
  partId: string;
}

interface printDragMoveStateType {
  offset: uvPointType;
  activePartId: string;
}

interface printDragMoveResultType {
  uv: uvPointType;
  partId: string;
  state: printDragMoveStateType;
}

interface gizmoPointerTargetType {
  element: printGizmoElementType;
  buttonHit: gizmoButtonHitType | null;
  onFrame: boolean;
  uv: uvPointType;
}

interface resolveGizmoPointerTargetContextType {
  raycaster: Raycaster;
  camera: Camera;
  scene: Scene;
  domElement: HTMLElement;
  atlasSize: { width: number; height: number };
}

interface resolveGizmoPointerTargetOptionsType {
  selectedInstanceId?: string | null;
  requireVisibleButtons?: boolean;
}

export type {
  gizmoButtonHitType,
  gizmoButtonHoverTargetType,
  gizmoPointerTargetType,
  printablePartMeshesType,
  printDragMoveResultType,
  printDragMoveStateType,
  printUvHitType,
  resolveGizmoPointerTargetContextType,
  resolveGizmoPointerTargetOptionsType,
};
