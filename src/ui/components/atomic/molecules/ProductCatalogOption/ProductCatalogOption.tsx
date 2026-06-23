'use client';

import { AtomImage, Button, Text } from '@atoms';
import type { productCatalogOptionPropsType } from '@types';

const ProductCatalogOption = ({ name, previewSrc, disabled = false, onSelect }: productCatalogOptionPropsType) => {
  return (
    <Button variant="select_part" className="h-[100px]" title={name} disabled={disabled} onClick={onSelect}>
      <div className="relative h-full w-full overflow-hidden rounded-[6px]">
        <AtomImage src={previewSrc} alt={name} className="h-full w-full" />
      </div>
      <Text className="sr-only">{name}</Text>
    </Button>
  );
};

export { ProductCatalogOption };
