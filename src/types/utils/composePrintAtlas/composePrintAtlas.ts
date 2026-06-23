import type { designPatternItemType, printAtlasConfigType } from '@types';

interface composePrintAtlasInputType {
  atlasSize: printAtlasConfigType;
  activePattern: designPatternItemType | null;
  patternColors: Record<string, string>;
  activeOpacity: number;
  defaultPattern: designPatternItemType | null;
  targetCanvas?: HTMLCanvasElement;
}

export type { composePrintAtlasInputType };
