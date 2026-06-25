import type { garmentConfigType } from '@types';

import { isColorOnlyGarmentPart } from '../resolveProductRenderConfig/resolveProductRenderConfig';

const hasPrintableGarmentParts = (product: garmentConfigType): boolean =>
  product.parts.some((part) => !isColorOnlyGarmentPart(part));

export { hasPrintableGarmentParts };
