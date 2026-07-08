import type { configuratorCatalogProductPickType, garmentConfigType } from '@types';
import { resolveGarmentTypeLabel } from '@utils/resolveGarmentTypeLabel';

const resolveAddProductDesignModalLabel = (
  product: configuratorCatalogProductPickType | null,
  garment: garmentConfigType | null | undefined,
): string => {
  if (garment?.type === 'shorts') return 'i pantaloncini';
  if (garment?.type === 'shirt') return 'la maglietta';

  const businessName = product?.business?.name?.trim();
  if (businessName) return businessName;

  return garment ? resolveGarmentTypeLabel(garment) : 'nuovo prodotto';
};

export { resolveAddProductDesignModalLabel };
