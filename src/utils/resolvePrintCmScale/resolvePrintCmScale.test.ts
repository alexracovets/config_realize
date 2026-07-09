import type { garmentConfigType } from '@types';
import { describe, expect, it } from 'vitest';

import { formatPxAsCm, resolvePrintCmScale } from '@utils/resolvePrintCmScale';

const baseProduct = {
  path: '/models/test/',
  patterns: [],
  printAtlas: { width: 2000, height: 1000 },
  parts: [
    // Larger panel (area 0.25) — should be picked as the primary body panel.
    { id: 'front', name: 'Davanti', label: 'Davanti', meshNames: [], uvBounds: { minX: 0, maxX: 0.5, minY: 0, maxY: 0.5 } },
    // Smaller panel — ignored.
    { id: 'sleeve', name: 'Manica', label: 'Manica', meshNames: [], uvBounds: { minX: 0.6, maxX: 0.7, minY: 0.6, maxY: 0.7 } },
  ],
} satisfies garmentConfigType;

describe('resolvePrintCmScale', () => {
  it('derives per-axis cm-per-px from the largest UV panel and L-size measurements', () => {
    const scale = resolvePrintCmScale(baseProduct, { heightCm: 50, widthCm: 40 });
    // panelWidthPx = 0.5 * 2000 = 1000 -> 40cm / 1000 = 0.04
    // panelHeightPx = 0.5 * 1000 = 500 -> 50cm / 500 = 0.1
    expect(scale).toEqual({ cmPerPxX: 0.04, cmPerPxY: 0.1 });
  });

  it('returns null when no reference measurements are provided', () => {
    expect(resolvePrintCmScale(baseProduct, null)).toBeNull();
    expect(resolvePrintCmScale(baseProduct, undefined)).toBeNull();
  });

  it('returns null when the product has no print atlas or no bounded panel', () => {
    expect(resolvePrintCmScale({ ...baseProduct, printAtlas: undefined }, { heightCm: 50, widthCm: 40 })).toBeNull();
    expect(resolvePrintCmScale({ ...baseProduct, parts: [] }, { heightCm: 50, widthCm: 40 })).toBeNull();
  });
});

describe('formatPxAsCm', () => {
  it('formats pixels as centimetres with one decimal', () => {
    expect(formatPxAsCm(100, 0.1)).toBe('10.0 cm');
    expect(formatPxAsCm(32, 0.05)).toBe('1.6 cm');
  });
});
