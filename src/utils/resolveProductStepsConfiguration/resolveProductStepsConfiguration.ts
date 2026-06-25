import { STEPS_CONFIGURATION } from '../../constants/STEPS_CONFIGURATION';
import type { garmentConfigType, headerConfigItemType } from '@types';

import { isConfiguratorStepAvailable } from './isConfiguratorStepAvailable';

const resolveProductStepsConfiguration = (product: garmentConfigType): headerConfigItemType[] =>
  STEPS_CONFIGURATION.filter((step) => isConfiguratorStepAvailable(product, step.value));

export { resolveProductStepsConfiguration };
