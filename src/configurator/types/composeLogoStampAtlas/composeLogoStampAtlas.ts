import type { stampPixelSizeType } from '@configurator/types';
import type { logoInstanceType } from '@types';
interface logoStampAtlasType {
  canvas: HTMLCanvasElement;
  cellSize: stampPixelSizeType;
}

interface composeLogoStampAtlasInputType {
  instances: logoInstanceType[];
  canvas: HTMLCanvasElement;
  atlasWidth: number;
  atlasHeight: number;
}

export type { composeLogoStampAtlasInputType, logoStampAtlasType };
