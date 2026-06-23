import type { uvBoundsType } from '@types';
import { DEFAULT_PART_TEXTURE_SIZE } from '@constants';

const drawPrintOnPart = (ctx: CanvasRenderingContext2D, size: number, printCanvas: HTMLCanvasElement, bounds: uvBoundsType) => {
  const pw = printCanvas.width;
  const ph = printCanvas.height;
  const sx = bounds.minX * pw;
  const sy = bounds.minY * ph;
  const sw = (bounds.maxX - bounds.minX) * pw;
  const sh = (bounds.maxY - bounds.minY) * ph;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(printCanvas, sx, sy, sw, sh, 0, 0, size, size);
  ctx.restore();
};

const composePartAlbedo = (
  color: string,
  printCanvas: HTMLCanvasElement | null,
  bounds: uvBoundsType,
  size = DEFAULT_PART_TEXTURE_SIZE,
  targetCanvas?: HTMLCanvasElement,
): HTMLCanvasElement => {
  const canvas = targetCanvas ?? document.createElement('canvas');

  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  if (printCanvas) {
    drawPrintOnPart(ctx, size, printCanvas, bounds);
  }

  return canvas;
};

export { composePartAlbedo };
