'use client';

import type { configuratorStepValueType } from '@configurator/types';
import { resolveProductStepsConfiguration } from '@hooks/resolveProductStepsConfiguration';
import { STEPS_CONFIGURATION } from '@molecules';
import { useConfigurationControl, useConfiguratorProduct } from '@store';
import { useEffect, useMemo } from 'react';
const useProductStepsConfiguration = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const setActiveStep = useConfigurationControl((state) => state.setActiveStep);

  const availableSteps = useMemo(() => {
    const availableValues = new Set<configuratorStepValueType>(resolveProductStepsConfiguration(product).map((step) => step.value));

    return STEPS_CONFIGURATION.filter((step) => availableValues.has(step.value as configuratorStepValueType));
  }, [product]);

  useEffect(() => {
    if (availableSteps.some((step) => step.step === activeStep)) return;
    setActiveStep(availableSteps[0]?.step ?? 1);
  }, [activeStep, availableSteps, setActiveStep]);

  return availableSteps;
};

export { useProductStepsConfiguration };
