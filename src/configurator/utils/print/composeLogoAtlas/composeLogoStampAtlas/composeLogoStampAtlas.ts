import type { composeLogoStampAtlasInputType, logoStampAtlasType } from '@configurator/types';
import type { logoInstanceType } from '@types';
import { LOGO_STAMP_ATLAS_MAX_PX } from '@configurator/constants';
import { loadCachedImage, resolveLogoReferenceDrawSize, resolveLogoStampAtlasGrid, resolveLogoStampPackOrder } from '@configurator/utils';

const configureLogoStampContext = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
};

const resolveLogoStampCellSize = (instances: logoInstanceType[], naturalById: Map<string, { width: number; height: number }>) => {
  let maxWidth = 1;
  let maxHeight = 1;

  instances.forEach((instance) => {
    const natural = naturalById.get(instance.id) ?? { width: 1, height: 1 };
    const { width, height } = resolveLogoReferenceDrawSize(instance, natural.width, natural.height);
    maxWidth = Math.max(maxWidth, Math.ceil(width));
    maxHeight = Math.max(maxHeight, Math.ceil(height));
  });

  return { width: maxWidth, height: maxHeight };
};

const resolveAtlasLimitRatio = (cellSize: { width: number; height: number }, grid: number) => {
  const largestSide = Math.max(cellSize.width, cellSize.height) * grid;
  if (largestSide <= LOGO_STAMP_ATLAS_MAX_PX) return 1;

  return LOGO_STAMP_ATLAS_MAX_PX / largestSide;
};

const fitCellSizeToAtlasLimit = (cellSize: { width: number; height: number }, grid: number) => {
  const ratio = resolveAtlasLimitRatio(cellSize, grid);
  if (ratio === 1) return cellSize;

  return {
    width: Math.max(1, Math.floor(cellSize.width * ratio)),
    height: Math.max(1, Math.floor(cellSize.height * ratio)),
  };
};

const composeLogoStampAtlas = async ({ instances, canvas }: composeLogoStampAtlasInputType): Promise<logoStampAtlasType> => {
  const grid = resolveLogoStampAtlasGrid();
  const packedInstances = resolveLogoStampPackOrder(instances).slice(0, grid * grid);
  const naturalById = new Map<string, { width: number; height: number }>();

  await Promise.all(
    packedInstances.map(async (instance) => {
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

  const referenceCellSize = resolveLogoStampCellSize(packedInstances, naturalById);
  const cellSize = fitCellSizeToAtlasLimit(referenceCellSize, grid);
  const atlasLimitRatio = Math.min(cellSize.width / referenceCellSize.width, cellSize.height / referenceCellSize.height);
  const nextWidth = cellSize.width * grid;
  const nextHeight = cellSize.height * grid;

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { canvas, cellSize, referenceCellSize, grid };

  configureLogoStampContext(ctx);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const [slotIndex, instance] of packedInstances.entries()) {
    try {
      const image = await loadCachedImage(instance.src);
      const natural = naturalById.get(instance.id) ?? { width: image.naturalWidth, height: image.naturalHeight };
      const reference = resolveLogoReferenceDrawSize(instance, natural.width, natural.height);
      const width = reference.width * atlasLimitRatio;
      const height = reference.height * atlasLimitRatio;
      const column = slotIndex % grid;
      const row = Math.floor(slotIndex / grid);

      ctx.globalAlpha = instance.opacity;
      ctx.drawImage(image, column * cellSize.width + (cellSize.width - width) / 2, row * cellSize.height + (cellSize.height - height) / 2, width, height);
      ctx.globalAlpha = 1;
    } catch {}
  }

  return { canvas, cellSize, referenceCellSize, grid };
};

export { composeLogoStampAtlas, fitCellSizeToAtlasLimit };
