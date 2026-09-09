import type { garmentConfigType } from '@types';

type garmentPrintFeatureFlagsType = {
  useName: boolean;
  useNumber: boolean;
  useLogo: boolean;
  useTesto: boolean;
  logoSlotCount: number;
};

const resolveGarmentPrintFeatureFlags = (product: garmentConfigType, logoSlotCount = 0): garmentPrintFeatureFlagsType => ({
  useName: (product.namePositions?.length ?? 0) > 0,
  useNumber: (product.numberPositions?.length ?? 0) > 0,
  useLogo: logoSlotCount > 0,
  useTesto: (product.testoPositions?.length ?? 0) > 0,
  logoSlotCount,
});

export { resolveGarmentPrintFeatureFlags };
export type { garmentPrintFeatureFlagsType };
