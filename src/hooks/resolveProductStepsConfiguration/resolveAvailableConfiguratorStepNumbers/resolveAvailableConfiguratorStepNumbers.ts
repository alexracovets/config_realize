import type { garmentConfigType } from '@types';
import { CONFIGURATOR_STEP_META } from '@constants';
import { isConfiguratorStepAvailable } from '@hooks/resolveProductStepsConfiguration/isConfiguratorStepAvailable';
const resolveAvailableConfiguratorStepNumbers = (product: garmentConfigType): number[] =>
  CONFIGURATOR_STEP_META.filter((step) => isConfiguratorStepAvailable(product, step.value)).map((step) => step.step);

export { resolveAvailableConfiguratorStepNumbers };
