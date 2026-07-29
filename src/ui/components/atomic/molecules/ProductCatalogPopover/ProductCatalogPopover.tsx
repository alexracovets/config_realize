'use client';

import {
  AtomDialog,
  AtomDialogContent,
  AtomDialogTitle,
  AtomDialogTrigger,
  AtomPopover,
  AtomPopoverContent,
  AtomPopoverTrigger,
  Button,
  Grid,
  Text,
} from '@atoms';
import { mapHomePageProductBusiness } from '@shopify/mapHomePageProductBusiness';
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<catalogPopoverViewType>('products');
  const [selectedCollectionHandle, setSelectedCollectionHandle] = useState(activeCollectionHandle);

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.handle === selectedCollectionHandle) ?? collections[0],
    [collections, selectedCollectionHandle],
  );

  const gridItems = view === 'collections' ? collections : (selectedCollection?.products ?? []);
  const columnCount = resolveCatalogGridColumns(gridItems.length);
  const popoverWidthPx = resolveCatalogGridWidthPx(columnCount) + POPOVER_PADDING_X_PX;

  const syncCatalogView = (nextOpen: boolean) => {
    if (nextOpen) {
      const initialHandle = activeCollectionHandle || collections[0]?.handle || '';
      setSelectedCollectionHandle(initialHandle);
      setView(initialHandle ? 'products' : 'collections');
      return;
    }

    setView('products');
    setSelectedCollectionHandle(activeCollectionHandle);
  };

  const handlePopoverOpenChange = (nextOpen: boolean) => {
    setPopoverOpen(nextOpen);
    syncCatalogView(nextOpen);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setDialogOpen(nextOpen);
    syncCatalogView(nextOpen);
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
    setPopoverOpen(false);
    setDialogOpen(false);
    syncCatalogView(false);
  };

  const handleCollectionSelect = (collectionHandle: string) => {
    setSelectedCollectionHandle(collectionHandle);
    setView('products');
  };

  const catalogOptions =
    view === 'collections'
      ? collections.map((collection) => (
          <ProductCatalogOption
            key={collection.id}
            name={collection.title}
            previewSrc={collection.imageSrc ?? ''}
            onSelect={() => handleCollectionSelect(collection.handle)}
          />
        ))
      : selectedCollection?.products.map((product) => (
          <ProductCatalogOption
            key={product.id}
            name={product.title}
            previewSrc={product.previewSrc ?? ''}
            disabled={!product.modelId || !hasModel(product.modelId)}
            onSelect={() => handleProductSelect(selectedCollection.handle, product)}
          />
        ));

  const catalogBackButton = view === 'products' && (
    <Button
      type="button"
      variant="ghost"
      className={cn('h-auto items-center justify-start gap-1 px-0 text-[14px] font-medium leading-none text-default hover:text-active')}
      onClick={() => setView('collections')}
    >
      <ArrowLeft className="size-4 shrink-0" /> Collezioni
    </Button>
  );

  return (
    <>
      <div className="contents max-sm:hidden">
        <AtomPopover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
          <AtomPopoverTrigger asChild>{children}</AtomPopoverTrigger>
          <AtomPopoverContent side={contentSide} align={contentAlign} className="flex flex-col gap-1 p-3" style={{ width: popoverWidthPx }}>
            <Text className="text-[16px] font-semibold uppercase text-default">
              {view === 'collections' ? 'Seleziona collezione' : 'Seleziona prodotto'}
            </Text>
            {catalogBackButton}
            <Grid
              style={{
                gap: CATALOG_GRID_GAP_PX,
                height: CATALOG_GRID_HEIGHT_PX,
                gridTemplateRows: `repeat(${CATALOG_GRID_ROWS}, ${CATALOG_CELL_HEIGHT_PX}px)`,
                gridTemplateColumns: `repeat(${columnCount}, ${CATALOG_CARD_SIZE_PX}px)`,
              }}
            >
              {catalogOptions}
            </Grid>
          </AtomPopoverContent>
        </AtomPopover>
      </div>

      <div className="hidden max-sm:contents">
        <AtomDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <AtomDialogTrigger asChild>{children}</AtomDialogTrigger>
          <AtomDialogContent
            aria-describedby={undefined}
            className="h-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] min-w-0 max-w-140 gap-3 overflow-hidden p-4 pt-10"
            closeButtonClassName="top-3 right-3 bg-transparent opacity-100"
          >
            <AtomDialogTitle className="text-[16px] font-semibold uppercase text-default">
              {view === 'collections' ? 'Seleziona collezione' : 'Seleziona prodotto'}
            </AtomDialogTitle>
            {catalogBackButton}
            <Grid className="max-h-[calc(100dvh-140px)] grid-cols-3 gap-2 overflow-y-auto overscroll-contain pr-1">{catalogOptions}</Grid>
          </AtomDialogContent>
        </AtomDialog>
      </div>
    </>
  );
};

export { ProductCatalogPopover };
