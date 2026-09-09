import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import canottaMagikBasket from '@data/canotta_magik_basket/canotta_magik_basket.json';

const SHAPE_PATTERN = /<(?:path|polygon|rect|circle|ellipse|polyline)\b[^>]*?\/>/g;

const readThumbnail = (designId: string) => readFileSync(path.resolve(__dirname, `../../../public/svg/design/basket/${designId}.svg`), 'utf8');

const readColorGroups = (svgText: string) => {
  const groups: string[] = [];
  const openTag = /<g id="color(\d+)">/g;

  for (let match = openTag.exec(svgText); match; match = openTag.exec(svgText)) {
    const token = /<g\b|<\/g>/g;
    token.lastIndex = openTag.lastIndex;

    let depth = 1;
    let end = svgText.length;

    for (let inner = token.exec(svgText); inner; inner = token.exec(svgText)) {
      if (inner[0] === '</g>') {
        depth -= 1;
        if (depth === 0) {
          end = inner.index;
          break;
        }
      } else {
        depth += 1;
      }
    }

    groups.push(svgText.slice(openTag.lastIndex, end));
  }

  return groups;
};

const countShapes = (svgText: string) => svgText.match(SHAPE_PATTERN)?.length ?? 0;

describe('basket design thumbnails', () => {
  const patterns = canottaMagikBasket.patterns.map((pattern) => [pattern.designId, pattern.parts.length] as const);

  it.each(patterns)('%s exposes one color group per configured part', (designId, partCount) => {
    expect(readColorGroups(readThumbnail(designId))).toHaveLength(partCount);
  });

  it.each(patterns)('%s puts every shape inside a color group', (designId) => {
    const svgText = readThumbnail(designId);
    const grouped = readColorGroups(svgText).reduce((total, group) => total + countShapes(group), 0);

    expect(grouped).toBe(countShapes(svgText));
  });

  it.each(patterns)('%s leaves no color group empty', (designId) => {
    readColorGroups(readThumbnail(designId)).forEach((group) => expect(countShapes(group)).toBeGreaterThan(0));
  });
});
