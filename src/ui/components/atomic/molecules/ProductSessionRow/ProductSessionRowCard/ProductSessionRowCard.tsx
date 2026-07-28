'use client';

import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { ProductSessionPreviewSkeleton } from '@skeletons';
import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';
import { PRODUCT_SESSION_ROW_PREVIEW_SIZE_PX } from '@molecules/ProductSessionRow/productSessionRowConstants';

type productSessionRowCardPropsType = Pick<productSessionRowPropsType, 'name' | 'previewSrc' | 'active' | 'onSelect' | 'onRemove'> & {

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
        'h-full w-full items-center overflow-hidden border border-gray-10',
        'transition-[border-color,background-color,box-shadow] duration-200 ease-out',
        active ? 'bg-white' : 'bg-gray-5',
        active && 'border-active shadow-sm',
        isPortal && isExpanded && 'shadow-md',
        'py-2 pr-2 pl-3',
      )}
    >
      <Grid
        className={cn('h-full w-full items-center', isPortal && 'gap-1')}
        style={
          isPortal
            ? { gridTemplateColumns: `${PRODUCT_SESSION_ROW_PREVIEW_SIZE_PX}px minmax(0, 1fr) auto` }
            : { gridTemplateColumns: 'minmax(0, 1fr)' }
        }
      >
        <Button type="button" variant="ghost" onClick={onSelect} className={cn('h-full w-full p-0 bg-transparent', active && 'cursor-default')}>
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
                'h-full min-w-0 items-center justify-center overflow-hidden p-0 bg-transparent text-center transition-opacity duration-200 ease-out',
                active && 'cursor-default',
                detailsVisible ? 'w-auto opacity-100' : 'pointer-events-none w-0 opacity-0',
              )}
            >
              <Text className="truncate whitespace-nowrap text-[12px] leading-4 font-semibold">{name}</Text>
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
              <SvgIcon name="delete" className="w-3.5 h-4 text-error" />
            </Button>
          </>
        )}
      </Grid>
    </Flex>
  );
};

export { ProductSessionRowCard };
