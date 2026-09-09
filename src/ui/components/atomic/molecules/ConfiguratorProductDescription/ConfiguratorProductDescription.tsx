'use client';

import { memo } from 'react';

import { Text } from '@atoms';

import { CONFIGURATOR_PRODUCT_DESCRIPTION } from '@constants';

const ConfiguratorProductDescription = memo(() => {
  return <Text variant="configurator_product_description">{CONFIGURATOR_PRODUCT_DESCRIPTION}</Text>;
});

ConfiguratorProductDescription.displayName = 'ConfiguratorProductDescription';

export { ConfiguratorProductDescription };
