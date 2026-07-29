'use client';

import { memo } from 'react';

import { Text } from '@atoms';
import { CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION } from '@constants';

const ConfiguratorLogoStepNotice = memo(() => {
  return (
    <div className="w-full rounded-[8px] border border-input-border px-3 max-xl:px-2.5 py-2 max-xl:py-1.5">
      <Text className="text-[12px] max-xl:text-[10px] font-normal leading-[1.2] text-gray">{CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION}</Text>
    </div>
  );
});

ConfiguratorLogoStepNotice.displayName = 'ConfiguratorLogoStepNotice';

export { ConfiguratorLogoStepNotice };
