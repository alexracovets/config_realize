'use client';

import { memo } from 'react';

import { Text } from '@atoms';
import { CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION } from '@constants';

const ConfiguratorLogoStepNotice = memo(() => {
  return (
    <div className="w-full rounded-[8px] border border-input-border px-3 py-2">
      <Text className="text-[12px] font-normal leading-[1.2] text-gray">{CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION}</Text>
    </div>
  );
});

ConfiguratorLogoStepNotice.displayName = 'ConfiguratorLogoStepNotice';

export { ConfiguratorLogoStepNotice };
