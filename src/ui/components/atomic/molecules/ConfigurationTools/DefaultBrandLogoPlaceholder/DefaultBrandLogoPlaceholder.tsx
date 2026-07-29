'use client';

import { AtomImage, Flex, Text } from '@atoms';

import { CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION, CONFIGURATOR_DEFAULT_BRAND_LOGO_SRC, CONFIGURATOR_DEFAULT_BRAND_LOGO_TITLE } from '@constants';

const DefaultBrandLogoPlaceholder = () => {
  return (
    <div className="w-full rounded-[8px] border border-input-border px-3 max-xl:px-2.5 py-2 max-xl:py-1.5">
      <Flex className="flex-col items-start gap-2 max-xl:gap-1.5">
        <Flex className="items-center gap-2 max-xl:gap-1.5">
          <AtomImage
            src={CONFIGURATOR_DEFAULT_BRAND_LOGO_SRC}
            alt="logo"
            width={16}
            height={16}
            className="object-contain shrink-0 max-xl:w-3.25 max-xl:h-3.25"
          />
          <Text className="text-[16px] max-xl:text-[13px] font-semibold tracking-wide text-black-10">{CONFIGURATOR_DEFAULT_BRAND_LOGO_TITLE}</Text>
        </Flex>
        <Text className="text-[12px] max-xl:text-[10px] font-normal leading-[1.2] text-gray">{CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION}</Text>
      </Flex>
    </div>
  );
};

export { DefaultBrandLogoPlaceholder };
