import type { textCanvasDrawOptionsType } from '@types';

const applyTextCanvasDrawOptions = (ctx: CanvasRenderingContext2D, options?: textCanvasDrawOptionsType) => {
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = options?.letterSpacing !== undefined ? `${options.letterSpacing}px` : '0px';
};

export { applyTextCanvasDrawOptions };
