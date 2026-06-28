import type { garmentConfigType, garmentPartConfigType } from '@types';

const resolveGarmentPart = (product: garmentConfigType, partId: string, placementLabel: string): garmentPartConfigType => {
  const part = product.parts.find((item) => item.id === partId);

  if (!part) {
    throw new Error(`Product "${product.path}" has no part "${partId}" for ${placementLabel}.`);
  }

  return part;
};

export { resolveGarmentPart };
