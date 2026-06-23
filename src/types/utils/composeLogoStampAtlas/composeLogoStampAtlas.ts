import type { logoInstanceType } from '@types';

import type { stampPixelSizeType } from '../stampPixelSize';

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
