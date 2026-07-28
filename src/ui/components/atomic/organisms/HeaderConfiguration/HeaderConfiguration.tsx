'use client';

import { ConfiguratorStepTabs } from '@molecules';
import { Flex } from '@atoms';

const HeaderConfiguration = () => {
  return (
    <Flex variant="header_configuration" asChild>
      <header>
        <ConfiguratorStepTabs />
      </header>
    </Flex>
  );
};

export { HeaderConfiguration };
