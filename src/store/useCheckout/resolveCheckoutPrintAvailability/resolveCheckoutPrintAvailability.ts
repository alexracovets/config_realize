'use client';

import type { checkoutPrintAvailabilityType, garmentConfigType } from '@types';
import { isConfiguratorStepAvailable } from '@hooks/resolveProductStepsConfiguration';

const resolveCheckoutPrintAvailability = (product?: garmentConfigType): checkoutPrintAvailabilityType => {
  if (!product) {
    return {
      hasName: true,
      hasNumber: true,
      hasTesto: true,
    };
  }

  return {
    hasName: isConfiguratorStepAvailable(product, 'name'),
    hasNumber: isConfiguratorStepAvailable(product, 'number'),
    hasTesto: isConfiguratorStepAvailable(product, 'testo'),
  };
};

export { resolveCheckoutPrintAvailability };
