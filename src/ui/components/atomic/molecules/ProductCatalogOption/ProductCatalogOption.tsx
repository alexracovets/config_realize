'use client';

import { AtomImage, Button, Flex, Text } from '@atoms';
import type { productCatalogOptionPropsType } from '@types';

const ProductCatalogOption = ({ name, previewSrc, disabled = false, onSelect }: productCatalogOptionPropsType) => {
  return (
    <Button
      variant="select_part"
      aria-label={name}
      className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 whitespace-normal"
      disabled={disabled}
      onClick={onSelect}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden">
        <AtomImage src={previewSrc} alt={name} aria-hidden fit="cover" className="h-full w-full" />
      </div>
      <Flex variant="product_card_name">
        <Text variant="product_card_name">{name}</Text>
      </Flex>
    </Button>
  );
};

export { ProductCatalogOption };
