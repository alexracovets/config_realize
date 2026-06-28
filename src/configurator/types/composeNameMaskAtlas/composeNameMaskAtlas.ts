import type { stampPixelSizeType } from '@configurator/types';
import type { garmentTextRenderInstanceType } from '@types';
interface composeNameMaskAtlasInputType {
  instances: garmentTextRenderInstanceType[];
  fillCanvas?: HTMLCanvasElement;
  strokeCanvas?: HTMLCanvasElement;
  redrawFill?: boolean;
  redrawStroke?: boolean;
}

interface nameMaskAtlasType {
  fillCanvas: HTMLCanvasElement;
  strokeCanvas: HTMLCanvasElement;
  stampSize: stampPixelSizeType;
}

export type { composeNameMaskAtlasInputType, nameMaskAtlasType };
