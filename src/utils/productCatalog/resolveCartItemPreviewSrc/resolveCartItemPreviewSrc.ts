import { getModel, resolveProductPreviewSrc } from '@utils/garmentCatalog/garmentCatalog';
import type { cartItemType } from '@types';

const resolveCartItemPreviewSrc = (item: Pick<cartItemType, 'modelId'>) => {
  const product = getModel(item.modelId);

  return product ? (resolveProductPreviewSrc(product) ?? '') : '';
};

export { resolveCartItemPreviewSrc };
