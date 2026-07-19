import { describe, expect, it } from 'vitest';

import { measureTextWidthAtFontSize, resolveFontSizeForWidth, resolveTextFitFromHeight, resolveTextFitFromWidth } from '@configurator/utils';

const createFakeMeasureCtx = (): CanvasRenderingContext2D => {
  let fontSize = 400;
  const ctx = {
    set font(value: string) {
      const match = /^(\d+(?:\.\d+)?)px/.exec(value);
      if (match) fontSize = Number(match[1]);
    },
    get font() {
      return `${fontSize}px sans-serif`;
    },
    measureText: (text: string) => ({
      width: text.length * fontSize * 0.6,
      actualBoundingBoxAscent: fontSize * 0.8,
      actualBoundingBoxDescent: fontSize * 0.2,
    }),
  };
  return ctx as unknown as CanvasRenderingContext2D;
};

describe('measureTextWidthAtFontSize', () => {
  it('scales linearly with font size', () => {
    const ctx = createFakeMeasureCtx();
    const widthAt100 = measureTextWidthAtFontSize('PLAYER', 'Oswald', 100, ctx);
    const widthAt200 = measureTextWidthAtFontSize('PLAYER', 'Oswald', 200, ctx);

    expect(widthAt200).toBeCloseTo(widthAt100 * 2, 5);
  });

  it('returns 0 for empty text', () => {
    const ctx = createFakeMeasureCtx();
    expect(measureTextWidthAtFontSize('', 'Oswald', 100, ctx)).toBe(0);
  });
});

describe('resolveFontSizeForWidth', () => {
  it('is the inverse of measureTextWidthAtFontSize', () => {
    const ctx = createFakeMeasureCtx();
    const width = measureTextWidthAtFontSize('PLAYER', 'Oswald', 150, ctx);
    const fontSize = resolveFontSizeForWidth('PLAYER', 'Oswald', width, ctx);

    expect(fontSize).toBeCloseTo(150, 5);
  });
});

describe('resolveTextFitFromHeight', () => {
  const limits = { heightMin: 10, heightMax: 400, widthMin: 10, widthMax: 200 };

  it('keeps the requested font size when the resulting width fits', () => {
    const ctx = createFakeMeasureCtx();
    const fit = resolveTextFitFromHeight('AB', 'Oswald', 100, limits, ctx);

    expect(fit.fontSize).toBe(100);
    expect(fit.width).toBeCloseTo(measureTextWidthAtFontSize('AB', 'Oswald', 100, ctx), 5);
  });

  it('shrinks the font size when the requested height would overflow the max width', () => {
    const ctx = createFakeMeasureCtx();
    const fit = resolveTextFitFromHeight('PLAYER', 'Oswald', 400, limits, ctx);

    expect(fit.fontSize).toBeLessThan(400);
    expect(fit.width).toBeLessThanOrEqual(limits.widthMax + 1e-6);
  });

  it('clamps the requested font size to the height limits first', () => {
    const ctx = createFakeMeasureCtx();
    const fit = resolveTextFitFromHeight('A', 'Oswald', 1000, limits, ctx);

    expect(fit.fontSize).toBeLessThanOrEqual(limits.heightMax);
  });
});

describe('resolveTextFitFromWidth', () => {
  const limits = { heightMin: 10, heightMax: 400, widthMin: 10, widthMax: 200 };

  it('derives the font size that renders the requested width', () => {
    const ctx = createFakeMeasureCtx();
    const fit = resolveTextFitFromWidth('AB', 'Oswald', 100, limits, ctx);

    expect(fit.width).toBeCloseTo(100, 5);
    expect(fit.fontSize).toBeCloseTo(resolveFontSizeForWidth('AB', 'Oswald', 100, ctx), 5);
  });

  it('clamps the requested width to the width limits', () => {
    const ctx = createFakeMeasureCtx();
    const fit = resolveTextFitFromWidth('AB', 'Oswald', 10000, limits, ctx);

    expect(fit.width).toBeLessThanOrEqual(limits.widthMax + 1e-6);
    expect(fit.fontSize).toBeLessThanOrEqual(limits.heightMax);
  });

  it('clamps the derived font size to the height limits, shrinking width again', () => {
    const ctx = createFakeMeasureCtx();
    const fit = resolveTextFitFromWidth('A', 'Oswald', 200, limits, ctx);

    expect(fit.fontSize).toBeLessThanOrEqual(limits.heightMax);
    expect(fit.width).toBeLessThan(200);
  });
});
