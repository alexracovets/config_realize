import type { cartItemType } from '@types';

import { resolveCartItemPreviewSrc } from './resolveCartItemPreviewSrc';

const resolveCartItemDisplayPreview = (item: Pick<cartItemType, 'collection' | 'slug' | 'modelId'>, capturedPreview?: string) =>
  capturedPreview ?? resolveCartItemPreviewSrc(item);

export { resolveCartItemDisplayPreview };
