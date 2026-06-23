import type { cartItemType } from '@types';

import { getModel, resolveProductPreviewSrc } from '../garmentCatalog/garmentCatalog';
import { resolveProductCatalogPreviewSrc } from '../resolveProductCatalogPreviewSrc/resolveProductCatalogPreviewSrc';
import { getCatalogProductEntry } from './productCatalog';

const resolveCartItemPreviewSrc = (item: Pick<cartItemType, 'collection' | 'slug' | 'modelId'>) => {
  const entry = getCatalogProductEntry(item.collection, item.slug);
  const product = getModel(item.modelId);
  const garmentPreviewSrc = product ? resolveProductPreviewSrc(product) : undefined;

  if (entry) return resolveProductCatalogPreviewSrc(entry, garmentPreviewSrc);

  return garmentPreviewSrc ?? '';
};

export { resolveCartItemPreviewSrc };
