import type { patternColorPairType } from '@configurator/types';
import type { designPatternItemType } from '@types';
import { PATTERN_LAYER_COUNT } from '@configurator/constants';

const DEFAULT_PATTERN_COLOR = '#000000';

const buildPatternColors = (
  pattern: designPatternItemType | null,
  patternColors: Record<string, string>,
  designLayerColors: Record<number, string>,
): patternColorPairType => {
  const colors: patternColorPairType = [
    designLayerColors[0] ?? DEFAULT_PATTERN_COLOR,
    designLayerColors[1] ?? DEFAULT_PATTERN_COLOR,
    designLayerColors[2] ?? DEFAULT_PATTERN_COLOR,
  ];

  if (!pattern) return colors;

  for (let index = 0; index < Math.min(pattern.parts.length, PATTERN_LAYER_COUNT); index += 1) {
    const part = pattern.parts[index];
    colors[index] = patternColors[part.key] ?? designLayerColors[part.colorIndex] ?? DEFAULT_PATTERN_COLOR;
  }

  return colors;
};

export { buildPatternColors };
