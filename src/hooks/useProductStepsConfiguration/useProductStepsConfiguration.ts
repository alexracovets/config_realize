'use client';

import { useEffect, useMemo } from 'react';

import { useConfigurationControl, useConfiguratorProduct } from '@store';
import { resolveProductStepsConfiguration } from '../../utils/resolveProductStepsConfiguration';

const useProductStepsConfiguration = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const setActiveStep = useConfigurationControl((state) => state.setActiveStep);

  const availableSteps = useMemo(() => resolveProductStepsConfiguration(product), [product]);

  useEffect(() => {
    if (availableSteps.some((step) => step.step === activeStep)) return;
    setActiveStep(availableSteps[0]?.step ?? 1);
  }, [activeStep, availableSteps, setActiveStep]);

  return availableSteps;
};

export { useProductStepsConfiguration };
