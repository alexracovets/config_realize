'use client';

import { memo } from 'react';

import { Text } from '@atoms';

import { CONFIGURATOR_PRODUCT_DESCRIPTION } from '@constants';

const ConfiguratorProductDescription = memo(() => {
  return <Text className="text-[14px] font-medium text-gray-40">{CONFIGURATOR_PRODUCT_DESCRIPTION}</Text>;
});

ConfiguratorProductDescription.displayName = 'ConfiguratorProductDescription';

export { ConfiguratorProductDescription };
