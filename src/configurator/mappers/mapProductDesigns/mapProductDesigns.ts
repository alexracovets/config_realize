import type { designPatternItemType, designPatternPartType, garmentConfigType, patternConfigType } from '@types';
import { resolveDesignCardPreviewSrc } from '@configurator/mappers';

const mapPatternParts = (pattern: patternConfigType, product: garmentConfigType, keyPrefix: string): designPatternPartType[] =>
  pattern.parts.map((part, partIndex) => ({
    key: `${keyPrefix}-part-${partIndex}`,
    src: `${product.path}designs/${part.path_name}`,
    colorIndex: (part.colorIndex ?? partIndex + 1) - 1,
  }));

const mapPatternItem = (pattern: patternConfigType, product: garmentConfigType, key: string, cardPreviewSrc: string): designPatternItemType => {
  const parts = mapPatternParts(pattern, product, key);

  return {
    key,
    name: pattern.name,
    designId: pattern.designId,
    cardPreviewSrc,
    parts,
    colorParts: [...parts].sort((left, right) => left.colorIndex - right.colorIndex),
  };
};

const mapProductDesigns = (product: garmentConfigType): designPatternItemType[] =>
  product.patterns.map((pattern, patternIndex) =>
    mapPatternItem(pattern, product, `pattern-${patternIndex}`, resolveDesignCardPreviewSrc(pattern.name, pattern.designId, product.id)),
  );

const mapDefaultPattern = (product: garmentConfigType): designPatternItemType | null => {
  const pattern = product.default_pattern?.[0];
  if (!pattern) return null;

  return mapPatternItem(pattern, product, 'default-pattern', '');
};

export { mapDefaultPattern, mapProductDesigns };
