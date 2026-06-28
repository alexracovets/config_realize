import type { patternColorPairType } from '@configurator/types';
import type { designPatternItemType } from '@types';
import { PATTERN_LAYER_COUNT } from '@configurator/constants';

const DEFAULT_PATTERN_COLOR = '#000000';

const buildPatternColors = (
  pattern: designPatternItemType | null,
  patternColors: Record<string, string>,
  designLayerColors: Record<number, string>,
): patternColorPairType => {
  const colors: [string, string] = [designLayerColors[0] ?? DEFAULT_PATTERN_COLOR, designLayerColors[1] ?? DEFAULT_PATTERN_COLOR];

  if (!pattern) return colors;

  for (let index = 0; index < Math.min(pattern.parts.length, PATTERN_LAYER_COUNT); index += 1) {
    colors[index] = patternColors[pattern.parts[index].key] ?? designLayerColors[index] ?? DEFAULT_PATTERN_COLOR;
  }

  return colors;
};

export { buildPatternColors };
