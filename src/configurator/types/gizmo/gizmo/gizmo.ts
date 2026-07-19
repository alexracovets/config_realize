import type { uvPointType } from '@types';

type gizmoHandleKindType = 'duplicate' | 'delete' | 'rotate' | 'scale';
type printGizmoElementKindType = 'name' | 'number' | 'testo' | 'logo';

interface fontSizeLimitsType {
  min: number;
  max: number;
}

interface printGizmoElementType {
  kind: printGizmoElementKindType;
  id: string;
  partId: string;
  slotIndex: number;
  meshNames: string[];
  uv: uvPointType;
  rotation: number;
  gizmoRotation: number;
  partRotation: number;
  scale: number;
  half: { x: number; y: number };
  fontSize?: number;
  fontSizeMin?: number;
  fontSizeMax?: number;
  scaleMin?: number;
  scaleMax?: number;
}

export type { fontSizeLimitsType, gizmoHandleKindType, printGizmoElementKindType, printGizmoElementType };
