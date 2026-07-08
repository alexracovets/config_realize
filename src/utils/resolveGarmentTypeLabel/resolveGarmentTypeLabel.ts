import type { garmentConfigType } from '@types';

const SHORTS_TYPE = 'shorts';
const SHIRT_TYPE = 'shirt';

const resolveGarmentTypeLabel = (product: garmentConfigType): string => {
  if (product.type === SHORTS_TYPE) return 'pantaloncini';
  if (product.type === SHIRT_TYPE) return 'maglietta';

  return product.name?.toLowerCase() ?? 'nuovo prodotto';
};

export { resolveGarmentTypeLabel };
