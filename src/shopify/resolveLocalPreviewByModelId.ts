import { CATALOG_PRODUCT_ENTRIES } from '@constants';

import { resolveProductFlipCardSrc } from '../utils/resolveProductFlipCardSrc/resolveProductFlipCardSrc';

const resolveLocalPreviewByModelId = (modelId: string | null | undefined) => {
  if (!modelId) {
    return { previewSrc: null, activePreviewSrc: null };
  }

  const entry = CATALOG_PRODUCT_ENTRIES.find((catalogEntry) => catalogEntry.modelId === modelId);
  if (!entry) {
    return { previewSrc: null, activePreviewSrc: null };
  }

  return {
    previewSrc: resolveProductFlipCardSrc(entry.collection, entry.slug, 'front'),
    activePreviewSrc: resolveProductFlipCardSrc(entry.collection, entry.slug, 'back'),
  };
};

export { resolveLocalPreviewByModelId };
