import { describe, expect, it } from 'vitest';

import type { garmentConfigType } from '@types';
import { mapProductDesigns } from '@configurator/mappers';

const product = {
  id: 'canotta_magik_basket',
  path: '/models/canotta_magik_basket/',
  parts: [],
  patterns: [
    {
      name: 'Design 8',
      designId: 'design_08',
      parts: [{ path_name: 'design_8_color_1.webp' }, { path_name: 'design_8_color_2.webp' }, { path_name: 'design_8_color_3.webp' }],
    },
    {
      name: 'Design 10',
      designId: 'design_10',
      parts: [
        { path_name: 'design_10_a.webp', colorIndex: 2 },
        { path_name: 'design_10_b.webp', colorIndex: 1 },
      ],
    },
  ],
} as garmentConfigType;

describe('mapProductDesigns', () => {
  it('keeps shader layer order and matches picker order for sequential colors', () => {
    const [design8] = mapProductDesigns(product);

    expect(design8.parts.map((part) => part.src)).toEqual([
      '/models/canotta_magik_basket/designs/design_8_color_1.webp',
      '/models/canotta_magik_basket/designs/design_8_color_2.webp',
      '/models/canotta_magik_basket/designs/design_8_color_3.webp',
    ]);
    expect(design8.colorParts).toEqual(design8.parts);
  });

  it('keeps shader layer order and reorders pickers by colorIndex', () => {
    const [, design10] = mapProductDesigns(product);

    expect(design10.parts.map((part) => part.src)).toEqual([
      '/models/canotta_magik_basket/designs/design_10_a.webp',
      '/models/canotta_magik_basket/designs/design_10_b.webp',
    ]);
    expect(design10.colorParts.map((part) => part.src)).toEqual([
      '/models/canotta_magik_basket/designs/design_10_b.webp',
      '/models/canotta_magik_basket/designs/design_10_a.webp',
    ]);
  });
});
