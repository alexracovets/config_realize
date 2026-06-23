import type { composeLogoStampAtlasInputType, logoInstanceType, logoStampAtlasType } from '@types';
import { LOGO_SLOT_COUNT } from '@constants';
import { loadCachedImage } from '../../loadCachedImage/loadCachedImage';
import { resolveLogoReferenceDrawSize } from '../composeLogoPrintAtlas';

const LOGO_STAMP_GRID = 2;

const configureLogoStampContext = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
};

const sanitizeLogoAlpha = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3]! < 4) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const resolveLogoStampCellSize = (instances: logoInstanceType[], naturalById: Map<string, { width: number; height: number }>) => {
  let maxWidth = 1;
  let maxHeight = 1;

  instances.slice(0, LOGO_SLOT_COUNT).forEach((instance) => {
    const natural = naturalById.get(instance.id) ?? { width: 1, height: 1 };
    const { width, height } = resolveLogoReferenceDrawSize(instance, natural.width, natural.height);
    maxWidth = Math.max(maxWidth, Math.ceil(width));
    maxHeight = Math.max(maxHeight, Math.ceil(height));
  });

  return { width: maxWidth, height: maxHeight };
};

const composeLogoStampAtlas = async ({ instances, canvas }: composeLogoStampAtlasInputType): Promise<logoStampAtlasType> => {
  const activeInstances = instances.filter((instance) => instance.src.trim()).slice(0, LOGO_SLOT_COUNT);
  const naturalById = new Map<string, { width: number; height: number }>();

  await Promise.all(
    activeInstances.map(async (instance) => {
      try {
        const image = await loadCachedImage(instance.src);
        naturalById.set(instance.id, {
          width: instance.naturalWidth || image.naturalWidth,
          height: instance.naturalHeight || image.naturalHeight,
        });
      } catch {
        naturalById.set(instance.id, { width: 1, height: 1 });
      }
    }),
  );

  const cellSize = resolveLogoStampCellSize(activeInstances, naturalById);
  canvas.width = cellSize.width * LOGO_STAMP_GRID;
  canvas.height = cellSize.height * LOGO_STAMP_GRID;

  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
  if (!ctx) return { canvas, cellSize };

  configureLogoStampContext(ctx);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scratch = document.createElement('canvas');
  scratch.width = cellSize.width;
  scratch.height = cellSize.height;
  const scratchCtx = scratch.getContext('2d', { alpha: true, willReadFrequently: true });
  if (!scratchCtx) return { canvas, cellSize };

  configureLogoStampContext(scratchCtx);

  for (const [slotIndex, instance] of activeInstances.entries()) {
    try {
      const image = await loadCachedImage(instance.src);
      const natural = naturalById.get(instance.id) ?? { width: image.naturalWidth, height: image.naturalHeight };
      const { width, height } = resolveLogoReferenceDrawSize(instance, natural.width, natural.height);

      scratchCtx.clearRect(0, 0, scratch.width, scratch.height);
      scratchCtx.globalCompositeOperation = 'source-over';
      scratchCtx.globalAlpha = instance.opacity;
      scratchCtx.drawImage(image, (cellSize.width - width) / 2, (cellSize.height - height) / 2, width, height);
      sanitizeLogoAlpha(scratchCtx, scratch.width, scratch.height);

      const column = slotIndex % LOGO_STAMP_GRID;
      const row = Math.floor(slotIndex / LOGO_STAMP_GRID);
      ctx.drawImage(scratch, column * cellSize.width, row * cellSize.height);
    } catch {
      // Skip broken assets.
    }
  }

  return { canvas, cellSize };
};

export { composeLogoStampAtlas };
