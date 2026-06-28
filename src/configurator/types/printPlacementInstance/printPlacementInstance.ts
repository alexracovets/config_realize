interface PrintPlacementInstance {
  id: string;
  partId: string;
  uv: { x: number; y: number };
  rotation: number;
  placementRotation?: number;
}

export type { PrintPlacementInstance };
