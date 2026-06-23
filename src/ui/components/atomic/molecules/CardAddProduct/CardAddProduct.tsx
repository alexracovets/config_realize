'use client';

import { useEffect } from 'react';

import { Flex, ScrollArea } from '@atoms';

import { getCatalogProductEntry, getModel, preloadGarmentProduct, resolveCartItemDisplayPreview } from '@utils';
import { useConfigurationCart } from '@store';

import { ProductCatalogPopover } from '../ProductCatalogPopover';
import { ProductSessionAddButton } from '../ProductSessionAddButton';
import { ProductSessionRow } from '../ProductSessionRow';

const CardAddProduct = () => {
  const items = useConfigurationCart((state) => state.items);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const previews = useConfigurationCart((state) => state.previews);
  const addItem = useConfigurationCart((state) => state.addItem);
  const selectItem = useConfigurationCart((state) => state.selectItem);
  const removeItem = useConfigurationCart((state) => state.removeItem);

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];

  useEffect(() => {
    for (const item of items) {
      preloadGarmentProduct(item.modelId);
    }
  }, [items]);

  return (
    <Flex className="absolute left-0 top-4 z-30 flex max-h-[calc(100%-1rem)] w-[92px] flex-col gap-0 overflow-visible">
      <ScrollArea className="min-h-0 w-full flex-1 pr-0">
        <Flex className="flex-col gap-0">
          {items.map((item) => {
            const product = getModel(item.modelId);
            if (!product) return null;

            const catalogEntry = getCatalogProductEntry(item.collection, item.slug);
            const displayName = catalogEntry?.name ?? item.business.name ?? product.name;

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
        <ProductCatalogPopover activeCollection={activeItem.collection} onSelect={addItem}>
          <ProductSessionAddButton />
        </ProductCatalogPopover>
      </div>
    </Flex>
  );
};

export { CardAddProduct };
