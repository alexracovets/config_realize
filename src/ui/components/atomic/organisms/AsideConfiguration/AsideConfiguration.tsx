'use client';

import { useEffect, useRef } from 'react';

import { Box, Flex, Grid, ScrollArea } from '@atoms';
import { CardAddProduct, ConfiguratorLogoStepNotice, ConfiguratorProduct, ConfiguratorProductDescription } from '@molecules';

import { registerAsideOrbitGuard } from '@configurator/canvas';
import { useProductStepsConfiguration, useShowConfigurationSkeleton } from '@hooks';
import { ConfigurationStepSkeleton, ConfiguratorProductDescriptionSkeleton } from '@skeletons';
import { useConfigurationControl } from '@store';

const ActiveStepContent = () => {
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const showSkeleton = useShowConfigurationSkeleton();
  const availableSteps = useProductStepsConfiguration();
  const stepConfig = availableSteps.find(({ step }) => step === activeStep);

  if (!stepConfig) return null;

  const { content: Content, value: stepValue } = stepConfig;
  const isLogoStep = stepValue === 'logo';

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col max-sm:py-0">
      <ScrollArea className="min-h-0 flex-1 w-full pt-0">
        <Flex variant="step_design" className="max-sm:py-1">
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
    </div>
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
          <Grid className="grid h-full min-h-0 w-83.5 grid-rows-[auto_minmax(0,1fr)] gap-6 max-xl:w-58.5 max-xl:gap-5 max-sm:w-full max-sm:grid-rows-[minmax(0,1fr)] max-sm:gap-0">
            <ConfiguratorProduct className="max-sm:hidden" />
            <ActiveStepContent />
          </Grid>
        </aside>
      </Box>
    </>
  );
};

export { AsideConfiguration };
