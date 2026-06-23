import { STEPS_CONFIGURATION } from '../../constants/STEPS_CONFIGURATION';
import type { configuratorStepValueType, garmentConfigType, headerConfigItemType } from '@types';

const isConfiguratorStepAvailable = (product: garmentConfigType, stepValue: string): boolean =>
  !(product.hiddenSteps ?? []).includes(stepValue as configuratorStepValueType);

const resolveProductStepsConfiguration = (product: garmentConfigType): headerConfigItemType[] =>
  STEPS_CONFIGURATION.filter((step) => isConfiguratorStepAvailable(product, step.value));

const resolveAvailableConfiguratorStepNumbers = (product: garmentConfigType): number[] => resolveProductStepsConfiguration(product).map((step) => step.step);

export { isConfiguratorStepAvailable, resolveAvailableConfiguratorStepNumbers, resolveProductStepsConfiguration };
