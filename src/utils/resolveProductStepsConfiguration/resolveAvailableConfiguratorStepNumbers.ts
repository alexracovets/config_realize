import { CONFIGURATOR_STEP_META } from '../../constants/configuratorStepMeta';
import type { garmentConfigType } from '@types';

import { isConfiguratorStepAvailable } from './isConfiguratorStepAvailable';

const resolveAvailableConfiguratorStepNumbers = (product: garmentConfigType): number[] =>
  CONFIGURATOR_STEP_META.filter((step) => isConfiguratorStepAvailable(product, step.value)).map((step) => step.step);

export { resolveAvailableConfiguratorStepNumbers };
