'use client';

import { resolveAvailableConfiguratorStepNumbers } from '@hooks';
import { useConfiguratorProduct } from '@store/useConfiguratorProduct';
import { create } from 'zustand';
interface ConfigurationControlState {
  activeStep: number;
  name: string;
  numberProduct: number;
  price: number;
  count: number;
  count_to_bonus: number;
  bonus_discount: number;
  minimum_count: number;
  setActiveStep: (step: number) => void;
  setNumberProduct: (numberProduct: number) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const resolveAvailableSteps = () => resolveAvailableConfiguratorStepNumbers(useConfiguratorProduct.getState().product);

const useConfigurationControl = create<ConfigurationControlState>((set, get) => ({
  activeStep: 1,
  name: 'Maglia Federer',
  numberProduct: 1,
  price: 100,
  count: 6,
  count_to_bonus: 5,
  bonus_discount: 0,
  minimum_count: 5,
  setActiveStep: (step) => {
    const availableSteps = resolveAvailableSteps();
    if (!availableSteps.includes(step)) return;
    set({ activeStep: step });
  },
  setNumberProduct: (numberProduct) => set({ numberProduct }),
  goToPreviousStep: () => {
    const availableSteps = resolveAvailableSteps();
    const { activeStep } = get();
    const currentIndex = availableSteps.indexOf(activeStep);
    if (currentIndex <= 0) return;
    set({ activeStep: availableSteps[currentIndex - 1] });
  },
  goToNextStep: () => {
    const availableSteps = resolveAvailableSteps();
    const { activeStep } = get();
    const currentIndex = availableSteps.indexOf(activeStep);
    if (currentIndex < 0) {
      set({ activeStep: availableSteps[0] ?? 1 });
      return;
    }
    if (currentIndex >= availableSteps.length - 1) return;
    set({ activeStep: availableSteps[currentIndex + 1] });
  },
}));

export { useConfigurationControl };
