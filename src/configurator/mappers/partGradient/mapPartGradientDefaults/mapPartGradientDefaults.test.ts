import { DISABLED_PART_GRADIENT, mapPartGradientDefaults } from '@configurator/mappers';
import type { garmentPartConfigType } from '@types';
import { describe, expect, it } from 'vitest';

describe('mapPartGradientDefaults', () => {
  it('disables gradients on color-only armhole bindings', () => {
    const sleeve: garmentPartConfigType = {
      id: 'canotta_magik_basket_sleeve_left',
      name: 'Manica 1',
      label: 'Manica 1',
      meshNames: ['basketball_top_sleeve_left'],
      colorOnly: true,
    };

    expect(mapPartGradientDefaults(sleeve)).toEqual(DISABLED_PART_GRADIENT);
  });
});
