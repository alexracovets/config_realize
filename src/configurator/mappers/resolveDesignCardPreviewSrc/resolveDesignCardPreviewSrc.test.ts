import { describe, expect, it } from 'vitest';

import { resolveDesignCardPreviewSrc } from '@configurator/mappers';

describe('resolveDesignCardPreviewSrc', () => {
  it('uses shared design icons for non-basket products', () => {
    expect(resolveDesignCardPreviewSrc('Design 1', 'design_01', 'federer_calcio')).toBe('/svg/design/design_01.svg');
  });

  it('uses basketball design icons for basket products', () => {
    expect(resolveDesignCardPreviewSrc('Design 1', 'design_01', 'canotta_magik_basket')).toBe('/svg/design/basket/design_01.svg?v=4');
    expect(resolveDesignCardPreviewSrc('Design 8', 'design_08', 'malone_basket')).toBe('/svg/design/basket/design_08.svg?v=7');
  });
});
