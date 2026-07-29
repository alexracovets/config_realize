'use client';

import { useCallback } from 'react';
import { AiOutlineBorderOuter } from 'react-icons/ai';
import { IoMdRedo, IoMdUndo } from 'react-icons/io';

import { Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { useProductStepsConfiguration } from '@hooks';
import { useConfigurationControl, useTutorialDialog } from '@store';
import { cn } from '@utils';

const AsideConfigurationUtility = () => {
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const goToPreviousStep = useConfigurationControl((state) => state.goToPreviousStep);
  const goToNextStep = useConfigurationControl((state) => state.goToNextStep);
  const isGizmoVisible = useConfigurationControl((state) => state.isGizmoVisible);
  const toggleGizmoVisible = useConfigurationControl((state) => state.toggleGizmoVisible);
  const setTutorialOpen = useTutorialDialog((state) => state.setIsOpen);
  const availableSteps = useProductStepsConfiguration();
  const firstStep = availableSteps[0]?.step ?? 1;
  const lastStep = availableSteps[availableSteps.length - 1]?.step ?? 1;

  const handleTutorial = useCallback(() => {
    setTutorialOpen(true);
  }, [setTutorialOpen]);

  const handleToggleGizmo = useCallback(() => {
    toggleGizmoVisible();
  }, [toggleGizmoVisible]);

  return (
    <aside className="p-4 pr-12 h-full max-sm:col-start-3 max-sm:row-start-1 max-sm:h-auto max-sm:w-fit max-sm:shrink-0 max-sm:self-start max-sm:p-2 max-sm:pt-7">
      <Flex className="flex-col justify-start h-full w-[253px] gap-6 max-sm:h-auto max-sm:w-fit max-sm:gap-2">
        <Grid className="grid-cols-2 gap-2 max-sm:grid-cols-1">
          <Button size="sm" onClick={goToPreviousStep} disabled={activeStep === firstStep} className="max-sm:size-9 max-sm:p-0">
            <IoMdUndo className="size-4" />
            <span className="max-sm:hidden">Annulla</span>
          </Button>
          <Button size="sm" onClick={goToNextStep} disabled={activeStep === lastStep} className="max-sm:size-9 max-sm:p-0">
            <span className="max-sm:hidden">Ripristina</span>
            <IoMdRedo className="size-4" />
          </Button>
        </Grid>
        <Flex className="flex-col gap-3 p-4 rounded-md border-2 border-input-border max-sm:w-9 max-sm:p-0 max-sm:border-0 max-sm:gap-0">
          <Text className="text-[16px] text-base-black font-medium max-sm:hidden">Hai bisogno di aiuto?</Text>
          <Button
            size="sm"
            variant="center"
            className="w-full max-sm:h-20 max-sm:flex-col max-sm:gap-1 max-sm:p-1"
            onClick={handleTutorial}
          >
            <SvgIcon name="question" />
            <span className="max-sm:[writing-mode:vertical-rl] max-sm:text-[11px]">Tutorial</span>
          </Button>
        </Flex>
        <Button
          size="sm"
          onClick={handleToggleGizmo}
          aria-pressed={isGizmoVisible}
          aria-label={isGizmoVisible ? 'Nascondi gizmo' : 'Mostra gizmo'}
          className={cn('hidden max-sm:flex max-sm:size-9 max-sm:p-0', !isGizmoVisible && 'opacity-50')}
        >
          <AiOutlineBorderOuter className="size-4 shrink-0" aria-hidden />
        </Button>
      </Flex>
    </aside>
  );
};

export { AsideConfigurationUtility };
