import type { designPatternItemType, garmentConfigType } from '@types';
import { resolveDesignCardPreviewSrc } from '@configurator/mappers';
const mapProductDesigns = (product: garmentConfigType): designPatternItemType[] =>
  product.patterns.map((pattern, patternIndex) => ({
    key: `pattern-${patternIndex}`,
    name: pattern.name,
    designId: pattern.designId,
    cardPreviewSrc: resolveDesignCardPreviewSrc(pattern.name, pattern.designId),
    parts: pattern.parts.map((part, partIndex) => {
      const src = `${product.path}designs/${part.path_name}`;
      return {
        key: `pattern-${patternIndex}-part-${partIndex}`,
        src,
      };
    }),
  }));

const mapDefaultPattern = (product: garmentConfigType): designPatternItemType | null => {
  const pattern = product.default_pattern?.[0];
  if (!pattern) return null;

  return {
    key: 'default-pattern',
    name: pattern.name,
    designId: pattern.designId,
    cardPreviewSrc: '',
    parts: pattern.parts.map((part, partIndex) => {
      const src = `${product.path}designs/${part.path_name}`;
      return {
        key: `default-pattern-part-${partIndex}`,
        src,
      };
    }),
  };
};

export { mapDefaultPattern, mapProductDesigns };
