import type { stampPixelSizeType } from '@configurator/types';
import type { logoInstanceType } from '@types';
interface logoStampAtlasType {
  canvas: HTMLCanvasElement;
  cellSize: stampPixelSizeType;
  referenceCellSize: stampPixelSizeType;
  grid: number;
}

interface composeLogoStampAtlasInputType {
  instances: logoInstanceType[];
  canvas: HTMLCanvasElement;
}

export type { composeLogoStampAtlasInputType, logoStampAtlasType };
