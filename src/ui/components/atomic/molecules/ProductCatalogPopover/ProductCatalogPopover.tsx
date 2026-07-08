'use client';

import { AtomPopover, AtomPopoverContent, AtomPopoverTrigger, Button, Grid, Text } from '@atoms';
import { mapHomePageProductBusiness } from '@shopify';
import { useConfiguratorCatalog } from '@providers/configuratorCatalogProvider';
import { ProductCatalogOption } from '@molecules/ProductCatalogOption';
import type { homePageCollectionType, productCatalogPopoverPropsType } from '@types';
import { cn, hasModel } from '@utils';
import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type catalogPopoverViewType = 'collections' | 'products';

const CATALOG_CARD_SIZE_PX = 160;
const CATALOG_GRID_GAP_PX = 4;
const CATALOG_GRID_ROWS = 2;
const CATALOG_TITLE_HEIGHT_PX = 40;
const CATALOG_CARD_INNER_GAP_PX = 4;
const CATALOG_CARD_PADDING_Y_PX = 8;
const CATALOG_CELL_HEIGHT_PX = CATALOG_CARD_SIZE_PX + CATALOG_TITLE_HEIGHT_PX + CATALOG_CARD_INNER_GAP_PX + CATALOG_CARD_PADDING_Y_PX;
const CATALOG_GRID_HEIGHT_PX = CATALOG_GRID_ROWS * CATALOG_CELL_HEIGHT_PX + (CATALOG_GRID_ROWS - 1) * CATALOG_GRID_GAP_PX;

const resolveCatalogGridColumns = (itemCount: number) => {
  if (itemCount <= 2) {
    return Math.max(1, itemCount);
  }

  return Math.ceil(itemCount / CATALOG_GRID_ROWS);
};

const resolveCatalogGridWidthPx = (columnCount: number) => columnCount * CATALOG_CARD_SIZE_PX + Math.max(0, columnCount - 1) * CATALOG_GRID_GAP_PX;

const POPOVER_PADDING_X_PX = 24;

const ProductCatalogPopover = ({
  activeCollectionHandle,
  onSelect,
  children,
  contentSide = 'right',
  contentAlign = 'start',
}: productCatalogPopoverPropsType) => {
  const { collections } = useConfiguratorCatalog();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<catalogPopoverViewType>('products');
  const [selectedCollectionHandle, setSelectedCollectionHandle] = useState(activeCollectionHandle);

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.handle === selectedCollectionHandle) ?? collections[0],
    [collections, selectedCollectionHandle],
  );

  const gridItems = view === 'collections' ? collections : (selectedCollection?.products ?? []);
  const columnCount = resolveCatalogGridColumns(gridItems.length);
  const popoverWidthPx = resolveCatalogGridWidthPx(columnCount) + POPOVER_PADDING_X_PX;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      const initialHandle = activeCollectionHandle || collections[0]?.handle || '';
      setSelectedCollectionHandle(initialHandle);
      setView(initialHandle ? 'products' : 'collections');
      return;
    }

    setView('products');
    setSelectedCollectionHandle(activeCollectionHandle);
  };

  const handleProductSelect = (collectionHandle: string, product: homePageCollectionType['products'][number]) => {
    if (!product.modelId || !hasModel(product.modelId)) return;

    onSelect({
      collectionHandle,
      slug: product.handle,
      modelId: product.modelId,
      business: mapHomePageProductBusiness(product, product.modelId),
      catalogPreviewSrc: product.previewSrc ?? product.flipPreviewSrc ?? product.activePreviewSrc ?? null,
    });
    handleOpenChange(false);
  };

  const handleCollectionSelect = (collectionHandle: string) => {
    setSelectedCollectionHandle(collectionHandle);
    setView('products');
  };

  return (
    <AtomPopover open={open} onOpenChange={handleOpenChange}>
      <AtomPopoverTrigger asChild>{children}</AtomPopoverTrigger>
      <AtomPopoverContent side={contentSide} align={contentAlign} className="flex flex-col gap-1 p-3" style={{ width: popoverWidthPx }}>
        <Text className="text-[16px]  uppercase font-semibold text-default">{view === 'collections' ? 'Seleziona collezione' : 'Seleziona prodotto'}</Text>
        {view === 'products' && (
          <Button
            type="button"
            variant="ghost"
            className={cn('h-auto justify-start leading-none items-center gap-1 px-0 text-[14px] font-medium text-default hover:text-active')}
            onClick={() => setView('collections')}
          >
            <ArrowLeft className="size-4 shrink-0" /> Collezioni
          </Button>
        )}
        <Grid
          style={{
            gap: CATALOG_GRID_GAP_PX,
            height: CATALOG_GRID_HEIGHT_PX,
            gridTemplateRows: `repeat(${CATALOG_GRID_ROWS}, ${CATALOG_CELL_HEIGHT_PX}px)`,
            gridTemplateColumns: `repeat(${columnCount}, ${CATALOG_CARD_SIZE_PX}px)`,
          }}
        >
          {view === 'collections' &&
            collections.map((collection) => (
              <ProductCatalogOption
                key={collection.id}
                name={collection.title}
                previewSrc={collection.imageSrc ?? ''}
                onSelect={() => handleCollectionSelect(collection.handle)}
              />
            ))}

          {view === 'products' &&
            selectedCollection?.products.map((product) => (
              <ProductCatalogOption
                key={product.id}
                name={product.title}
                previewSrc={product.previewSrc ?? ''}
                disabled={!product.modelId || !hasModel(product.modelId)}
                onSelect={() => handleProductSelect(selectedCollection.handle, product)}
              />
            ))}
        </Grid>
      </AtomPopoverContent>
    </AtomPopover>
  );
};

export { ProductCatalogPopover };
