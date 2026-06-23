'use client';

import { Flex, Grid, ScrollArea } from '@atoms';
import { CardAddProduct, ConfiguratorProduct, ConfiguratorProductDescription } from '@molecules';

import { useProductStepsConfiguration, useShowConfigurationSkeleton } from '@hooks';
import { ConfigurationStepSkeleton, ConfiguratorProductDescriptionSkeleton } from '@skeletons';
import { useConfigurationControl } from '@store';

const ActiveStepContent = () => {
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const showSkeleton = useShowConfigurationSkeleton();
  const availableSteps = useProductStepsConfiguration();
  const stepConfig = availableSteps.find(({ step }) => step === activeStep);

  if (!stepConfig) return null;

  const { content: Content } = stepConfig;

  return (
    <div className="flex min-h-0 flex-1 flex-col py-1">
      <ScrollArea className="min-h-0 flex-1 w-full pt-0">
        <Flex variant="step_design">
          {showSkeleton ? <ConfiguratorProductDescriptionSkeleton /> : <ConfiguratorProductDescription />}
          {showSkeleton ? <ConfigurationStepSkeleton step={activeStep} /> : <Content />}
        </Flex>
      </ScrollArea>
    </div>
  );
};

const AsideConfiguration = () => {
  return (
    <aside className="relative h-full min-h-0 overflow-visible p-4 pl-28">
      <CardAddProduct />
      <Grid className="grid h-full min-h-0 w-[334px] grid-rows-[auto_minmax(0,1fr)] gap-6">
        <ConfiguratorProduct />
        <ActiveStepContent />
      </Grid>
    </aside>
  );
};

export { AsideConfiguration };
