import type { patternConfigType } from '@types';

interface designPatternPartType {
  key: string;
  src: string;
}

type designPatternItemType = Pick<patternConfigType, 'name' | 'designId'> & {
  key: string;
  /** Step DESIGN grid preview — `/svg/design/design_XX.svg`. */
  cardPreviewSrc: string;
  parts: designPatternPartType[];
};

export type { designPatternItemType, designPatternPartType };
