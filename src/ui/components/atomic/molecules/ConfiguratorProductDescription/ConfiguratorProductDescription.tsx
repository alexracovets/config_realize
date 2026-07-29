'use client';

import { memo } from 'react';

import { Text } from '@atoms';

import { CONFIGURATOR_PRODUCT_DESCRIPTION } from '@constants';

const ConfiguratorProductDescription = memo(() => {
  return (
    <Text className="text-[14px] font-medium text-gray-40 max-xl:text-[11px] max-xl:leading-4 max-sm:text-[12px] max-sm:leading-4">
      {CONFIGURATOR_PRODUCT_DESCRIPTION}
    </Text>
  );
});

ConfiguratorProductDescription.displayName = 'ConfiguratorProductDescription';

export { ConfiguratorProductDescription };
