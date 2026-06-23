import type { designPatternItemType, printAtlasConfigType } from '@types';

interface composePrintAtlasFboInputType {
  atlasSize: printAtlasConfigType;
  activePattern: designPatternItemType | null;
  patternColors: Record<string, string>;
  activeOpacity: number;
  defaultPattern: designPatternItemType | null;
}

export type { composePrintAtlasFboInputType };
