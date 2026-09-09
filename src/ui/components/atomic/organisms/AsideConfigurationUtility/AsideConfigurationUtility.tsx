'use client';

import { useCallback } from 'react';
import { AiOutlineBorderOuter } from 'react-icons/ai';
import { IoMdRedo, IoMdUndo } from 'react-icons/io';

import { Box, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { redoConfiguration, undoConfiguration, useConfigurationCart, useConfigurationControl, useConfigurationHistory, useTutorialDialog } from '@store';

const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;
const LOGO_STEP = 7;

const isGizmoToggleStep = (step: number) => step === NAME_STEP || step === NUMBER_STEP || step === TESTO_STEP || step === LOGO_STEP;

const AsideConfigurationUtility = () => {
  const isGizmoVisible = useConfigurationControl((state) => state.isGizmoVisible);
  const toggleGizmoVisible = useConfigurationControl((state) => state.toggleGizmoVisible);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const showGizmoToggle = isGizmoToggleStep(activeStep);
  const setTutorialOpen = useTutorialDialog((state) => state.setIsOpen);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const historyStack = useConfigurationHistory((state) => state.stacks[activeItemId]);
  const canUndo = Boolean(historyStack?.past.length);
  const canRedo = Boolean(historyStack?.future.length);

  const handleTutorial = useCallback(() => {
    setTutorialOpen(true);
  }, [setTutorialOpen]);

  const handleToggleGizmo = useCallback(() => {
    toggleGizmoVisible();
  }, [toggleGizmoVisible]);

  return (
    <Box variant="aside_utility" asChild>
      <aside>
        <Flex variant="aside_utility_column">
          <Grid variant="aside_utility_actions">
            <Button size="sm" onClick={undoConfiguration} disabled={!canUndo} title="Annulla (Ctrl+Z)" className="max-xl:size-8 max-xl:p-0 max-sm:size-9">
              <IoMdUndo className="size-4 max-sm:size-4" />
              <span className="max-xl:hidden">Annulla</span>
            </Button>
            <Button
              size="sm"
              onClick={redoConfiguration}
              disabled={!canRedo}
              title="Ripristina (Ctrl+Shift+Z)"
              className="max-xl:size-8 max-xl:p-0 max-sm:size-9"
            >
              <span className="max-xl:hidden">Ripristina</span>
              <IoMdRedo className="size-4 max-sm:size-4" />
            </Button>
          </Grid>
          <Flex variant="aside_utility_help_panel">
            <Text variant="aside_help_title">Hai bisogno di aiuto?</Text>
            <Button size="sm" variant="center" className="w-full max-xl:h-auto max-xl:flex-col max-xl:gap-1 max-xl:p-1.5 max-sm:h-20" onClick={handleTutorial}>
              <SvgIcon name="question" />
              <span className="max-xl:[writing-mode:vertical-rl] max-xl:text-[14px] max-sm:text-[11px]">Tutorial</span>
            </Button>
          </Flex>
          {showGizmoToggle ? (
            <Button
              size="sm"
              onClick={handleToggleGizmo}
              aria-pressed={isGizmoVisible}
              aria-label={isGizmoVisible ? 'Nascondi gizmo' : 'Mostra gizmo'}
              data-active={isGizmoVisible}
              className="hidden max-xl:flex max-xl:size-8 max-xl:p-0 max-sm:size-9 data-[active=false]:opacity-50"
            >
              <AiOutlineBorderOuter className="size-4 max-sm:size-4 shrink-0" aria-hidden />
            </Button>
          ) : null}
        </Flex>
      </aside>
    </Box>
  );
};

export { AsideConfigurationUtility };
