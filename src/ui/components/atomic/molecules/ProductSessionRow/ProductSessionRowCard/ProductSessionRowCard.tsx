'use client';

import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { ProductSessionPreviewSkeleton } from '@skeletons';
import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';

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
  <Flex className="relative shrink-0 w-11 h-11 max-sm:w-7 max-sm:h-7">
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
        'max-sm:py-2 max-sm:pr-2 max-sm:pl-3',
      )}
    >
      <Grid
        className={cn(
          'h-full w-full items-center',
          isPortal
            ? 'gap-3 pr-3 grid-cols-[60px_minmax(0,1fr)_auto] max-sm:gap-1 max-sm:pr-0 max-sm:grid-cols-[28px_minmax(0,1fr)_auto]'
            : 'grid-cols-[60px] max-sm:grid-cols-[28px]',
        )}
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
                'h-full min-w-0 justify-start items-center overflow-hidden p-0 text-left transition-opacity duration-200 ease-out',
                'max-sm:bg-transparent',
                active && 'cursor-default',
                detailsVisible ? 'w-auto opacity-100' : 'pointer-events-none w-0 opacity-0',
              )}
            >
              <Text className="truncate whitespace-nowrap text-[14px] font-medium max-sm:text-[12px] max-sm:leading-4 max-sm:font-semibold">{name}</Text>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-hidden={!detailsVisible}
              tabIndex={detailsVisible ? 0 : -1}
              className={cn(
                'shrink-0 transition-opacity duration-200 ease-out',
                'max-sm:bg-transparent max-sm:hover:bg-transparent',
                detailsVisible ? 'opacity-100' : 'pointer-events-none w-0 opacity-0',
              )}
              aria-label={`Rimuovi ${name}`}
              onClick={handleRemove}
            >
              <SvgIcon name="delete" className="text-error max-sm:w-3.5 max-sm:h-4" />
            </Button>
          </>
        )}
      </Grid>
    </Flex>
  );
};

export { ProductSessionRowCard };
