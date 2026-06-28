'use client';

import { AtomImage, Button, Flex, Grid, SvgIcon, Text } from '@atoms';

import { ProductSessionPreviewSkeleton } from '@skeletons';
import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';

import { PRODUCT_SESSION_ROW_CARD_WIDTH_PX, PRODUCT_SESSION_ROW_PREVIEW_SIZE_PX } from './productSessionRow.constants';

type productSessionRowCardPropsType = Pick<productSessionRowPropsType, 'name' | 'previewSrc' | 'active' | 'onSelect' | 'onRemove'> & {
  showDetails: boolean;
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
  showDetails,
  isExpanded,
  isPreviewLoaded,
  onPreviewLoad,
  onSelect,
  onRemove,
}: productSessionRowCardPropsType) => {
  const handleRemove = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <Flex
      data-active={active}
      className={cn(
        'h-full items-center border border-gray-10 bg-gray-5',
        'transition-shadow duration-200 ease-out',
        showDetails ? 'w-max max-w-full overflow-hidden' : 'w-full overflow-hidden',
        active && 'border-active shadow-sm',
        isExpanded && 'shadow-md',
      )}
    >
      <Grid
        className={cn('h-full items-center', showDetails ? 'w-max max-w-full gap-3 pr-3' : 'w-full overflow-hidden')}
        style={{
          gridTemplateColumns: showDetails
            ? `${PRODUCT_SESSION_ROW_CARD_WIDTH_PX}px max-content auto`
            : `${PRODUCT_SESSION_ROW_CARD_WIDTH_PX}px`,
        }}
      >
        <Button type="button" variant="ghost" onClick={onSelect} className={cn('h-full w-full p-0', active && 'cursor-default')}>
          <Flex className="size-full items-center justify-center">
            <ProductSessionRowPreview name={name} previewSrc={previewSrc} isPreviewLoaded={isPreviewLoaded} onPreviewLoad={onPreviewLoad} />
          </Flex>
        </Button>
        {showDetails && (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={onSelect}
              className={cn('h-full w-auto max-w-full min-w-0 justify-start items-center p-0 text-left', active && 'cursor-default')}
            >
              <Text className="truncate whitespace-nowrap text-[14px] font-medium">{name}</Text>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 bg-transparent hover:bg-transparent"
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
