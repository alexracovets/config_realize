'use client';

import { ProductCatalogPopover } from '@molecules/ProductCatalogPopover';
import { ProductSessionAddButton } from '@molecules/ProductSessionAddButton';
import { ProductSessionRow } from '@molecules/ProductSessionRow';
import { Flex, ScrollArea } from '@atoms';
import { useGarmentCatalogPreloadEffect } from '@hooks';
import { useConfigurationCart } from '@store';
import { getModel, resolveCartItemDisplayPreview } from '@utils';
import { useMemo } from 'react';
const CardAddProduct = () => {
  const items = useConfigurationCart((state) => state.items);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const previews = useConfigurationCart((state) => state.previews);
  const addItem = useConfigurationCart((state) => state.addItem);
  const selectItem = useConfigurationCart((state) => state.selectItem);
  const removeItem = useConfigurationCart((state) => state.removeItem);

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];
  const modelIds = useMemo(() => items.map((item) => item.modelId), [items]);

  useGarmentCatalogPreloadEffect(modelIds);

  return (
    <Flex className="absolute left-0 top-4 z-30 flex max-h-[calc(100%-1rem)] w-[92px] flex-col gap-0 overflow-visible">
      <ScrollArea className="min-h-0 w-full flex-1 pr-0">
        <Flex className="flex-col gap-0">
          {items.map((item) => {
            const product = getModel(item.modelId);
            if (!product) return null;

            const displayName = item.business.name ?? product.name;

            return (
              <ProductSessionRow
                key={item.id}
                name={displayName}
                previewSrc={resolveCartItemDisplayPreview(item, previews[item.id])}
                active={item.id === activeItemId}
                onSelect={() => selectItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            );
          })}
        </Flex>
      </ScrollArea>
      <div className="shrink-0">
        <ProductCatalogPopover activeCollectionHandle={activeItem.collectionHandle} onSelect={addItem}>
          <ProductSessionAddButton />
        </ProductCatalogPopover>
      </div>
    </Flex>
  );
};

export { CardAddProduct };
