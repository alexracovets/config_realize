import type { garmentConfigType, printCmScaleType } from '@types';
import { describe, expect, it } from 'vitest';

import { resolveNamePositionLimits, resolveNumberPositionLimits, resolveTestoPositionLimits } from '@configurator/mappers';

const cmScale: printCmScaleType = { cmPerPxHorizontal: 0.04, cmPerPxVertical: 0.1 };

const baseDefaults = {
  text: 'TESTO',
  font: 'Inter',
  textColor: '#000000',
  strokeColor: '#FFFFFF',
  strokeWidth: 0,
};

const basePosition = {
  key: 'pos-0',
  label: 'Position',
  partId: 'front',
  uv: { x: 0.5, y: 0.5 },
  rotation: 0,
  fontSize: 100,
  showFrame: true,
  showGizmo: true,
  interactive: true,
};

const buildProduct = (defaults: garmentConfigType['testoDefaults']): garmentConfigType => ({
  path: '/models/test/',
  parts: [],
  patterns: [],
  nameDefaults: defaults,
  numberDefaults: defaults,
  testoDefaults: defaults,
});

describe('text limits in centimetres', () => {
  it('converts a position own cm-defined height/width limits to atlas px using the garment-axis cm scale', () => {
    const product = buildProduct({ ...baseDefaults, strokeWidthMaxCm: 1 });
    const position = { ...basePosition, heightMinCm: 2, heightMaxCm: 30, widthMinCm: 3, widthMaxCm: 40 };

    expect(resolveNamePositionLimits(product, position, cmScale)).toMatchObject({
      heightMin: 20,
      heightMax: 300,
      widthMin: 75,
      widthMax: 1000,
      strokeWidthMax: 10,
    });
    expect(resolveNumberPositionLimits(product, position, cmScale)).toMatchObject({ heightMin: 20, heightMax: 300, widthMin: 75, widthMax: 1000 });
    expect(resolveTestoPositionLimits(product, position, cmScale)).toMatchObject({ heightMin: 20, heightMax: 300, widthMin: 75, widthMax: 1000 });
  });

  it('converts letter-spacing limits (still step-level) using the horizontal cm scale', () => {
    const product = buildProduct({ ...baseDefaults, letterSpacingMinCm: -0.4, letterSpacingMaxCm: 2 });

    expect(resolveTestoPositionLimits(product, basePosition, cmScale)).toMatchObject({ letterSpacingMin: -10, letterSpacingMax: 50 });
  });

  it('applies the built-in per-step fallback (Masha spec) when the position defines no cm limits', () => {
    const product = buildProduct(baseDefaults);

    expect(resolveNamePositionLimits(product, basePosition, cmScale)).toMatchObject({ heightMin: 10, heightMax: 60, widthMin: 25, widthMax: 875 });
    expect(resolveTestoPositionLimits(product, basePosition, cmScale)).toMatchObject({ heightMin: 10, heightMax: 20, widthMin: 25, widthMax: 625 });
  });

  it('lets a position override just one axis, falling back to the built-in default for the other', () => {
    const product = buildProduct(baseDefaults);
    const position = { ...basePosition, heightMaxCm: 10 };

    expect(resolveNumberPositionLimits(product, position, cmScale)).toMatchObject({ heightMax: 100 });
  });
});
