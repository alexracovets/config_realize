import type { composePrintAtlasInputType, designPatternItemType, printAtlasConfigType } from '@types';
import { loadCachedImage } from '../loadCachedImage/loadCachedImage';

const createWorkCanvas = (size: printAtlasConfigType) => {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
};

const drawTinted = (ctx: CanvasRenderingContext2D, tintBuffer: HTMLCanvasElement, source: CanvasImageSource, color: string, width: number, height: number) => {
  if (tintBuffer.width !== width || tintBuffer.height !== height) {
    tintBuffer.width = width;
    tintBuffer.height = height;
  }

  const bufferCtx = tintBuffer.getContext('2d');
  if (!bufferCtx) return;

  bufferCtx.globalCompositeOperation = 'source-over';
  bufferCtx.clearRect(0, 0, width, height);
  bufferCtx.drawImage(source, 0, 0, width, height);
  bufferCtx.globalCompositeOperation = 'source-in';
  bufferCtx.fillStyle = color;
  bufferCtx.fillRect(0, 0, width, height);
  ctx.drawImage(tintBuffer, 0, 0);
};

const drawPattern = async (
  ctx: CanvasRenderingContext2D,
  tintBuffer: HTMLCanvasElement,
  pattern: designPatternItemType,
  colors: Record<string, string>,
  opacity: number,
  width: number,
  height: number,
) => {
  ctx.save();
  ctx.globalAlpha = opacity;

  for (const part of pattern.parts) {
    const image = await loadCachedImage(part.src);
    const color = colors[part.key];

    if (color) {
      drawTinted(ctx, tintBuffer, image, color, width, height);
    } else {
      ctx.drawImage(image, 0, 0, width, height);
    }
  }

  ctx.restore();
};

const composePrintAtlas = async (input: composePrintAtlasInputType): Promise<HTMLCanvasElement> => {
  const canvas = input.targetCanvas ?? createWorkCanvas(input.atlasSize);
  const tintBuffer = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  if (canvas.width !== input.atlasSize.width || canvas.height !== input.atlasSize.height) {
    canvas.width = input.atlasSize.width;
    canvas.height = input.atlasSize.height;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (input.activePattern) {
    await drawPattern(ctx, tintBuffer, input.activePattern, input.patternColors, input.activeOpacity, canvas.width, canvas.height);
  }

  if (input.defaultPattern) {
    await drawPattern(ctx, tintBuffer, input.defaultPattern, {}, 1, canvas.width, canvas.height);
  }

  return canvas;
};

export { composePrintAtlas };
