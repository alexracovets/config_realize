import type { garmentConfigType } from '@types';
import { describe, expect, it } from 'vitest';

import { cmToPx, createPrintUnit, DEFAULT_PRINT_REFERENCE_CM, formatCm, formatPxAsCm, pxToCm, resolvePrintCmScale } from '@utils/resolvePrintCmScale';

const baseProduct = {
  path: '/models/test/',
  patterns: [],
  printAtlas: { width: 2000, height: 1000 },
  parts: [
    { id: 'front', name: 'Davanti', label: 'Davanti', meshNames: [], uvBounds: { minX: 0, maxX: 0.5, minY: 0, maxY: 0.5 } },
    { id: 'sleeve', name: 'Manica', label: 'Manica', meshNames: [], uvBounds: { minX: 0.6, maxX: 0.7, minY: 0.6, maxY: 0.7 } },
  ],
} satisfies garmentConfigType;

describe('resolvePrintCmScale', () => {
  it('derives garment-axis cm-per-px from the largest UV panel and L-size measurements', () => {
    const scale = resolvePrintCmScale(baseProduct, { heightCm: 50, widthCm: 40 });
    expect(scale).toEqual({ cmPerPxHorizontal: 0.08, cmPerPxVertical: 0.05 });
  });

  it('falls back to the default reference measurements when none are provided', () => {
    const expected = {
      cmPerPxHorizontal: DEFAULT_PRINT_REFERENCE_CM.widthCm / 500,
      cmPerPxVertical: DEFAULT_PRINT_REFERENCE_CM.heightCm / 1000,
    };
    expect(resolvePrintCmScale(baseProduct, null)).toEqual(expected);
    expect(resolvePrintCmScale(baseProduct, undefined)).toEqual(expected);
  });

  it('keeps atlas axes when the primary panel is stored upright', () => {
    const upright = {
      ...baseProduct,
      printAtlas: { width: 1000, height: 2000 },
      parts: [{ id: 'back', name: 'Retro', label: 'Retro', meshNames: [], uvBounds: { minX: 0, maxX: 0.5, minY: 0, maxY: 0.5 } }],
    } satisfies garmentConfigType;

    expect(resolvePrintCmScale(upright, { heightCm: 50, widthCm: 40 })).toEqual({ cmPerPxHorizontal: 0.08, cmPerPxVertical: 0.05 });
  });

  it('returns null when the product has no print atlas or no bounded panel', () => {
    expect(resolvePrintCmScale({ ...baseProduct, printAtlas: undefined }, { heightCm: 50, widthCm: 40 })).toBeNull();
    expect(resolvePrintCmScale({ ...baseProduct, parts: [] }, { heightCm: 50, widthCm: 40 })).toBeNull();
  });
});

describe('conversion helpers', () => {
  it('converts between centimetres and atlas pixels', () => {
    expect(cmToPx(10, 0.1)).toBe(100);
    expect(pxToCm(100, 0.1)).toBe(10);
  });

  it('formats centimetre values with one decimal', () => {
    expect(formatCm(3.24)).toBe('3.2 cm');
    expect(formatPxAsCm(100, 0.1)).toBe('10.0 cm');
    expect(formatPxAsCm(32, 0.05)).toBe('1.6 cm');
  });
});

describe('createPrintUnit', () => {
  it('presents atlas px in centimetres and converts user input back', () => {
    const unit = createPrintUnit(0.1);
    expect(unit.isCm).toBe(true);
    expect(unit.toUnit(123)).toBeCloseTo(12.3);
    expect(unit.toPx(12.3)).toBeCloseTo(123);
    expect(unit.formatUnit(12.3)).toBe('12.3 cm');
    expect(unit.formatPx(123)).toBe('12.3 cm');
    expect(unit.step).toBe(0.1);
  });

  it('passes raw pixels through when no cm scale is available', () => {
    const unit = createPrintUnit(null);
    expect(unit.isCm).toBe(false);
    expect(unit.toUnit(123.4)).toBe(123);
    expect(unit.toPx(123)).toBe(123);
    expect(unit.formatUnit(123)).toBe('123px');
    expect(unit.formatPx(123.4)).toBe('123px');
    expect(unit.step).toBe(1);
  });
});
