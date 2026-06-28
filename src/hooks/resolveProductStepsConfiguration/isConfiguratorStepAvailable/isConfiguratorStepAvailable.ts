import type { configuratorStepValueType } from '@configurator/types';
import type { garmentConfigType } from '@types';

const isConfiguratorStepAvailable = (product: garmentConfigType, stepValue: string): boolean =>
  !(product.hiddenSteps ?? []).includes(stepValue as configuratorStepValueType);

export { isConfiguratorStepAvailable };
