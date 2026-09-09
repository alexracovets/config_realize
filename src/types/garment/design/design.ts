import type { patternConfigType } from '@types';

interface designPatternPartType {
  key: string;
  src: string;
  colorIndex: number;
}

type designPatternItemType = Pick<patternConfigType, 'name' | 'designId'> & {
  key: string;
  cardPreviewSrc: string;
  parts: designPatternPartType[];
  colorParts: designPatternPartType[];
};

export type { designPatternItemType, designPatternPartType };
