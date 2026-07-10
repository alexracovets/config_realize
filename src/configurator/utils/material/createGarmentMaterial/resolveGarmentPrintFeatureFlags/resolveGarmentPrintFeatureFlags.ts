import type { garmentConfigType } from '@types';

type garmentPrintFeatureFlagsType = {
  useName: boolean;
  useNumber: boolean;
  useLogo: boolean;
  useTesto: boolean;
};

const resolveGarmentPrintFeatureFlags = (product: garmentConfigType): garmentPrintFeatureFlagsType => ({
  useName: (product.namePositions?.length ?? 0) > 0,
  useNumber: (product.numberPositions?.length ?? 0) > 0,
  useLogo: true,
  useTesto: (product.testoPositions?.length ?? 0) > 0,
});

export { resolveGarmentPrintFeatureFlags };
export type { garmentPrintFeatureFlagsType };
