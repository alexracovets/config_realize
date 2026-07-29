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
    <aside
      className={cn(
        'p-4 pr-12 h-full',
        'max-xl:absolute max-xl:right-2 max-xl:top-7 max-xl:z-30 max-xl:h-auto max-xl:w-fit max-xl:px-1 max-xl:pb-2 max-xl:pt-0',
        'max-sm:right-2 max-sm:top-7',
      )}
    >
      <Flex className="flex-col justify-start h-full w-[253px] gap-6 max-xl:h-auto max-xl:w-fit max-xl:gap-2">
        <Grid className="grid-cols-2 gap-2 max-xl:grid-cols-1">
          <Button size="sm" onClick={goToPreviousStep} disabled={activeStep === firstStep} className="max-xl:size-8 max-xl:p-0 max-sm:size-9">
            <IoMdUndo className="size-4 max-sm:size-4" />
            <span className="max-xl:hidden">Annulla</span>
          </Button>
          <Button size="sm" onClick={goToNextStep} disabled={activeStep === lastStep} className="max-xl:size-8 max-xl:p-0 max-sm:size-9">
            <span className="max-xl:hidden">Ripristina</span>
            <IoMdRedo className="size-4 max-sm:size-4" />
          </Button>
        </Grid>
        <Flex className="flex-col gap-3 p-4 rounded-md border-2 border-input-border max-xl:w-8 max-xl:p-0 max-xl:border-0 max-xl:gap-0 max-sm:w-9">
          <Text className="text-[16px] text-base-black font-medium max-xl:hidden">Hai bisogno di aiuto?</Text>
          <Button
            size="sm"
            variant="center"
            className="w-full max-xl:h-auto max-xl:flex-col max-xl:gap-1 max-xl:p-1.5 max-sm:h-20"
            onClick={handleTutorial}
          >
            <SvgIcon name="question" />
            <span className="max-xl:[writing-mode:vertical-rl] max-xl:text-[14px] max-sm:text-[11px]">Tutorial</span>
          </Button>
        </Flex>
        <Button
          size="sm"
          onClick={handleToggleGizmo}
          aria-pressed={isGizmoVisible}
          aria-label={isGizmoVisible ? 'Nascondi gizmo' : 'Mostra gizmo'}
          className={cn('hidden max-xl:flex max-xl:size-8 max-xl:p-0 max-sm:size-9', !isGizmoVisible && 'opacity-50')}
        >
          <AiOutlineBorderOuter className="size-4 max-sm:size-4 shrink-0" aria-hidden />
        </Button>
      </Flex>
    </aside>
  );
};

export { AsideConfigurationUtility };
