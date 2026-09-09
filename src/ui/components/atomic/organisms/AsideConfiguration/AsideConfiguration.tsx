'use client';

import { useEffect, useRef } from 'react';

import { Box, Flex, Grid, ScrollArea } from '@atoms';
import { CardAddProduct, ConfiguratorLogoStepNotice, ConfiguratorProduct, ConfiguratorProductDescription } from '@molecules';

import { registerAsideOrbitGuard } from '@configurator/canvas';
import { useProductStepsConfiguration, useShowConfigurationSkeleton } from '@hooks';
import { ConfigurationStepSkeleton, ConfiguratorProductDescriptionSkeleton } from '@skeletons';
import { useConfigurationControl, useScrollHintTutorial } from '@store';

const ActiveStepContent = () => {
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const setScrollHintTarget = useScrollHintTutorial((state) => state.setTargetElement);
  const showSkeleton = useShowConfigurationSkeleton();
  const availableSteps = useProductStepsConfiguration();
  const stepConfig = availableSteps.find(({ step }) => step === activeStep);

  if (!stepConfig) return null;

  const { content: Content, value: stepValue } = stepConfig;
  const isLogoStep = stepValue === 'logo';

  return (
    <Box variant="content_panel">
      <ScrollArea className="min-h-0 flex-1 w-full pt-0" onRootElementChange={setScrollHintTarget}>
        <Flex variant="step_design_mobile_padded">
          <ConfiguratorProduct className="hidden max-sm:flex" />
          {showSkeleton ? (
            <>
              {isLogoStep ? <ConfiguratorLogoStepNotice /> : null}
              <ConfiguratorProductDescriptionSkeleton />
            </>
          ) : (
            <>
              {isLogoStep ? <ConfiguratorLogoStepNotice /> : null}
              <ConfiguratorProductDescription />
            </>
          )}
          {showSkeleton ? <ConfigurationStepSkeleton step={activeStep} /> : <Content />}
        </Flex>
      </ScrollArea>
    </Box>
  );
};

const AsideConfiguration = () => {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => registerAsideOrbitGuard(asideRef.current), []);

  return (
    <>
      <CardAddProduct className="hidden max-sm:flex" />
      <Box variant="aside_configuration" asChild>
        <aside ref={asideRef}>
          <CardAddProduct className="max-sm:hidden" />
          <Grid variant="aside_configuration_layout">
            <ConfiguratorProduct className="max-sm:hidden" />
            <ActiveStepContent />
          </Grid>
        </aside>
      </Box>
    </>
  );
};

export { AsideConfiguration };
