import type { configuratorStepMetaItemType } from '@constants';
import type { garmentConfigType } from '@types';
import { CONFIGURATOR_STEP_META } from '@constants';
import { isConfiguratorStepAvailable } from '@hooks/resolveProductStepsConfiguration/isConfiguratorStepAvailable';
const resolveProductStepsConfiguration = (product: garmentConfigType): configuratorStepMetaItemType[] =>
  CONFIGURATOR_STEP_META.filter((step) => isConfiguratorStepAvailable(product, step.value));

export { resolveProductStepsConfiguration };
