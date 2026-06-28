'use client';

import { AtomTabs } from '@atoms';
import { useProductStepsConfiguration } from '@hooks';
import { ConfiguratorStepTabsList } from '@molecules/ConfiguratorStepTabs/ConfiguratorStepTabsList';
import { useConfigurationControl } from '@store';
import { useCallback } from 'react';
const ConfiguratorStepTabs = () => {
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const setActiveStep = useConfigurationControl((state) => state.setActiveStep);
  const availableSteps = useProductStepsConfiguration();
  const activeItem = availableSteps.find((item) => item.step === activeStep) ?? availableSteps[0];

  const handleValueChange = useCallback(
    (value: string) => {
      const step = availableSteps.find((item) => item.value === value)?.step;
      if (step) setActiveStep(step);
    },
    [availableSteps, setActiveStep],
  );

  if (!activeItem) return null;

  const activeIndex = availableSteps.findIndex((item) => item.value === activeItem.value);

  return (
    <AtomTabs variant="configurator" value={activeItem.value} onValueChange={handleValueChange} hideContent>
      <ConfiguratorStepTabsList items={availableSteps} activeIndex={activeIndex} />
    </AtomTabs>
  );
};

export { ConfiguratorStepTabs };
