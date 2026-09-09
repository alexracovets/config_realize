'use client';

import { AtomImage, Box, Button, Flex, Text } from '@atoms';
import type { productCatalogOptionPropsType } from '@types';

const ProductCatalogOption = ({ name, previewSrc, disabled = false, onSelect }: productCatalogOptionPropsType) => {
  return (
    <Button variant="catalog_option" aria-label={name} disabled={disabled} onClick={onSelect}>
      <Box variant="catalog_option_media_frame">
        <AtomImage src={previewSrc} alt={name} aria-hidden fit="cover" className="h-full w-full" />
      </Box>
      <Flex variant="product_card_name">
        <Text variant="product_card_name">{name}</Text>
      </Flex>
    </Button>
  );
};

export { ProductCatalogOption };
