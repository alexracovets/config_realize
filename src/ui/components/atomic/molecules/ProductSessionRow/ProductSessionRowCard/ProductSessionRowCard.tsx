'use client';

import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { ProductSessionPreviewSkeleton } from '@skeletons';
import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';
import { PRODUCT_SESSION_ROW_CARD_WIDTH_PX, PRODUCT_SESSION_ROW_PREVIEW_SIZE_PX } from '@molecules/ProductSessionRow/productSessionRowConstants';

type productSessionRowCardPropsType = Pick<productSessionRowPropsType, 'name' | 'previewSrc' | 'active' | 'onSelect' | 'onRemove'> & {
  /** Anchor card: collapsed only. Portal card: details stay mounted and animate via isExpanded. */
  variant: 'anchor' | 'portal';
  isExpanded: boolean;
  isPreviewLoaded: boolean;
  onPreviewLoad: () => void;
};

const ProductSessionRowPreview = ({
  name,
  previewSrc,
  isPreviewLoaded,
  onPreviewLoad,
}: Pick<productSessionRowCardPropsType, 'name' | 'previewSrc' | 'isPreviewLoaded' | 'onPreviewLoad'>) => (
  <Flex className="relative shrink-0" style={{ width: PRODUCT_SESSION_ROW_PREVIEW_SIZE_PX, height: PRODUCT_SESSION_ROW_PREVIEW_SIZE_PX }}>
    {!isPreviewLoaded && <ProductSessionPreviewSkeleton />}
    <AtomImage src={previewSrc} alt={name} className={cn('h-full w-full object-contain', !isPreviewLoaded && 'opacity-0')} onLoad={onPreviewLoad} />
  </Flex>
);

const ProductSessionRowCard = ({
  name,
  previewSrc,
  active = false,
  variant,
  isExpanded,
  isPreviewLoaded,
  onPreviewLoad,
  onSelect,
  onRemove,
}: productSessionRowCardPropsType) => {
  const isPortal = variant === 'portal';
  const detailsVisible = isPortal && isExpanded;

  const handleRemove = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <Flex
      data-active={active}
      className={cn(
        'h-full w-full items-center overflow-hidden border border-gray-10 bg-gray-5',
        'transition-[border-color,box-shadow] duration-200 ease-out',
        active && 'border-active shadow-sm',
        isPortal && isExpanded && 'shadow-md',
      )}
    >
      <Grid
        className={cn('h-full w-full items-center', isPortal && 'gap-3 pr-3')}
        style={{
          gridTemplateColumns: isPortal ? `${PRODUCT_SESSION_ROW_CARD_WIDTH_PX}px minmax(0, 1fr) auto` : `${PRODUCT_SESSION_ROW_CARD_WIDTH_PX}px`,
        }}
      >
        <Button type="button" variant="ghost" onClick={onSelect} className={cn('h-full w-full p-0', active && 'cursor-default')}>
          <Flex className="size-full items-center justify-center">
            <ProductSessionRowPreview name={name} previewSrc={previewSrc} isPreviewLoaded={isPreviewLoaded} onPreviewLoad={onPreviewLoad} />
          </Flex>
        </Button>
        {isPortal && (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={onSelect}
              aria-hidden={!detailsVisible}
              tabIndex={detailsVisible ? 0 : -1}
              className={cn(
                'h-full min-w-0 justify-start items-center overflow-hidden p-0 text-left transition-opacity duration-200 ease-out',
                active && 'cursor-default',
                detailsVisible ? 'w-auto opacity-100' : 'pointer-events-none w-0 opacity-0',
              )}
            >
              <Text className="truncate whitespace-nowrap text-[14px] font-medium">{name}</Text>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-hidden={!detailsVisible}
              tabIndex={detailsVisible ? 0 : -1}
              className={cn(
                'shrink-0 bg-transparent transition-opacity duration-200 ease-out hover:bg-transparent',
                detailsVisible ? 'opacity-100' : 'pointer-events-none w-0 opacity-0',
              )}
              aria-label={`Rimuovi ${name}`}
              onClick={handleRemove}
            >
              <SvgIcon name="delete" className="text-error" />
            </Button>
          </>
        )}
      </Grid>
    </Flex>
  );
};

export { ProductSessionRowCard };
