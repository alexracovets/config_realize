'use client';

import type { catalogProductRefType, productCatalogPopoverPropsType, productCollectionIdType } from '@types';
import { listCatalogProductsByCollection } from '@utils';
import { PRODUCT_COLLECTIONS } from '@constants';

import { useState } from 'react';

import { AtomPopover, AtomPopoverContent, AtomPopoverTrigger, Button, Grid, Text } from '@atoms';

import { ProductCatalogOption } from '../ProductCatalogOption';

type catalogPopoverViewType = 'groups' | 'products';

const ProductCatalogPopover = ({ activeCollection, onSelect, children, contentSide = 'right', contentAlign = 'start' }: productCatalogPopoverPropsType) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<catalogPopoverViewType>('products');
  const [selectedCollection, setSelectedCollection] = useState<productCollectionIdType>(activeCollection);

  const collectionProducts = listCatalogProductsByCollection(selectedCollection);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setView('products');
      setSelectedCollection(activeCollection);
      return;
    }

    setView('products');
    setSelectedCollection(activeCollection);
  };

  const handleProductSelect = (product: catalogProductRefType) => {
    if (!product.configurable) return;

    onSelect({
      collection: product.collection,
      slug: product.slug,
      modelId: product.modelId,
    });
    handleOpenChange(false);
  };

  const handleGroupSelect = (collectionId: productCollectionIdType) => {
    setSelectedCollection(collectionId);
    setView('products');
  };

  return (
    <AtomPopover open={open} onOpenChange={handleOpenChange}>
      <AtomPopoverTrigger asChild>{children}</AtomPopoverTrigger>
      <AtomPopoverContent side={contentSide} align={contentAlign} className="w-[240px] p-3" gap="sm">
        <Text className="text-[14px] font-semibold text-default">{view === 'groups' ? 'Seleziona gruppo' : 'Seleziona prodotto'}</Text>

        {view === 'products' && (
          <Button type="button" variant="ghost" className="h-auto justify-start px-0 text-[13px] text-gray" onClick={() => setView('groups')}>
            ← Gruppi
          </Button>
        )}

        <Grid className="grid-cols-2 gap-2">
          {view === 'groups' &&
            PRODUCT_COLLECTIONS.map((collection) => (
              <ProductCatalogOption
                key={collection.id}
                name={collection.label}
                previewSrc={collection.coverSrc}
                onSelect={() => handleGroupSelect(collection.id)}
              />
            ))}

          {view === 'products' &&
            collectionProducts.map((product) => (
              <ProductCatalogOption
                key={`${product.collection}-${product.slug}`}
                name={product.name}
                previewSrc={product.previewSrc}
                disabled={!product.configurable}
                onSelect={() => handleProductSelect(product)}
              />
            ))}
        </Grid>
      </AtomPopoverContent>
    </AtomPopover>
  );
};

export { ProductCatalogPopover };
