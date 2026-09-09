'use client';

import { memo } from 'react';

import { Box, Text } from '@atoms';
import { CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION } from '@constants';

const ConfiguratorLogoStepNotice = memo(() => {
  return (
    <Box variant="brand_logo_placeholder_shell">
      <Text variant="configurator_brand_logo_description">{CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION}</Text>
    </Box>
  );
});

ConfiguratorLogoStepNotice.displayName = 'ConfiguratorLogoStepNotice';

export { ConfiguratorLogoStepNotice };
