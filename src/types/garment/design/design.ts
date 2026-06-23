import type { patternConfigType } from '@types';

interface designPatternPartType {
  key: string;
  src: string;
  previewSrc: string;
}

type designPatternItemType = Pick<patternConfigType, 'name'> & {
  key: string;
  parts: designPatternPartType[];
};

export type { designPatternItemType, designPatternPartType };
