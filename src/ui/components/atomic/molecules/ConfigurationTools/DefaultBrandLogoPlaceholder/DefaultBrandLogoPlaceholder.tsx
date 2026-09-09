'use client';

import { AtomImage, Box, Flex, Text } from '@atoms';

import { CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION, CONFIGURATOR_DEFAULT_BRAND_LOGO_SRC, CONFIGURATOR_DEFAULT_BRAND_LOGO_TITLE } from '@constants';

const DefaultBrandLogoPlaceholder = () => {
  return (
    <Box variant="brand_logo_placeholder_shell">
      <Flex variant="brand_placeholder_column">
        <Flex variant="brand_placeholder_row">
          <Box className="relative size-4 shrink-0 max-xl:size-3.25">
            <AtomImage src={CONFIGURATOR_DEFAULT_BRAND_LOGO_SRC} alt="logo" />
          </Box>
          <Text variant="configurator_brand_logo_title">{CONFIGURATOR_DEFAULT_BRAND_LOGO_TITLE}</Text>
        </Flex>
        <Text variant="configurator_brand_logo_description">{CONFIGURATOR_DEFAULT_BRAND_LOGO_DESCRIPTION}</Text>
      </Flex>
    </Box>
  );
};

export { DefaultBrandLogoPlaceholder };
