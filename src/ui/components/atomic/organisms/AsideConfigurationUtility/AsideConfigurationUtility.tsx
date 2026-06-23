'use client';

import { useCallback } from 'react';
import { IoMdRedo, IoMdUndo } from 'react-icons/io';

import { Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { useProductStepsConfiguration } from '@hooks';
import { useConfigurationControl, useTutorialDialog } from '@store';

const AsideConfigurationUtility = () => {
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const goToPreviousStep = useConfigurationControl((state) => state.goToPreviousStep);
  const goToNextStep = useConfigurationControl((state) => state.goToNextStep);
  const setTutorialOpen = useTutorialDialog((state) => state.setIsOpen);
  const availableSteps = useProductStepsConfiguration();
  const firstStep = availableSteps[0]?.step ?? 1;
  const lastStep = availableSteps[availableSteps.length - 1]?.step ?? 1;

  const handleTutorial = useCallback(() => {
    setTutorialOpen(true);
  }, [setTutorialOpen]);

  return (
    <aside className="p-4 pr-12">
      <Flex className="flex-col justify-start h-full w-[253px] gap-6">
        <Grid className="grid-cols-2 gap-2">
          <Button size="sm" onClick={goToPreviousStep} disabled={activeStep === firstStep}>
            <IoMdUndo className="size-4" />
            Annulla
          </Button>
          <Button size="sm" onClick={goToNextStep} disabled={activeStep === lastStep}>
            Ripristina
            <IoMdRedo className="size-4" />
          </Button>
        </Grid>
        <Flex className="flex-col gap-3 p-4 rounded-md border-2 border-input-border">
          <Text className="text-[16px] text-base-black font-medium">Hai bisogno di aiuto?</Text>
          <Button size="sm" variant="center" className="w-full" onClick={handleTutorial}>
            <SvgIcon name="question" />
            Tutorial
          </Button>
        </Flex>
      </Flex>
    </aside>
  );
};

export { AsideConfigurationUtility };
