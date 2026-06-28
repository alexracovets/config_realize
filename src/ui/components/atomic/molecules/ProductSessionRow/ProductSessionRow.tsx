'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

import { Box } from '@atoms';

import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';

import { ProductSessionRowCard } from './ProductSessionRowCard';
import {
  PRODUCT_SESSION_ROW_CARD_HEIGHT_PX,
  PRODUCT_SESSION_ROW_CARD_WIDTH_PX,
  PRODUCT_SESSION_ROW_EXPANDED_VIEWPORT_PADDING_PX,
  PRODUCT_SESSION_ROW_SCROLL_EDGE_PADDING_PX,
} from './productSessionRow.constants';
import { useProductSessionRowHover } from './useProductSessionRowHover';

const ProductSessionRow = ({ name, previewSrc, active = false, onSelect, onRemove }: productSessionRowPropsType) => {
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const { anchorRef, portalRef, isHovered, isExpanded, position, showHover, hideHover, rememberPointer } = useProductSessionRowHover();

  const cardProps = {
    name,
    previewSrc,
    active,
    onSelect,
    onRemove,
    isPreviewLoaded,
    onPreviewLoad: () => setIsPreviewLoaded(true),
  };

  return (
    <>
      <Box
        asChild
        className={cn('relative shrink-0 overflow-hidden', isHovered && 'invisible')}
        style={{
          width: PRODUCT_SESSION_ROW_CARD_WIDTH_PX,
          height: PRODUCT_SESSION_ROW_CARD_HEIGHT_PX,
          scrollMarginTop: PRODUCT_SESSION_ROW_SCROLL_EDGE_PADDING_PX,
          scrollMarginBottom: PRODUCT_SESSION_ROW_SCROLL_EDGE_PADDING_PX,
        }}
      >
        <div ref={anchorRef} onMouseEnter={(event) => showHover(event.clientX, event.clientY)}>
          <ProductSessionRowCard {...cardProps} showDetails={false} isExpanded={false} />
        </div>
      </Box>
      {isHovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <Box
            asChild
            className={cn(
              'fixed z-50 overflow-hidden transition-shadow duration-200 ease-out',
              isExpanded && 'w-max',
            )}
            style={{
              top: position.top,
              left: position.left,
              width: isExpanded ? 'max-content' : PRODUCT_SESSION_ROW_CARD_WIDTH_PX,
              maxWidth: isExpanded
                ? `calc(100vw - ${position.left}px - ${PRODUCT_SESSION_ROW_EXPANDED_VIEWPORT_PADDING_PX}px)`
                : PRODUCT_SESSION_ROW_CARD_WIDTH_PX,
              minWidth: PRODUCT_SESSION_ROW_CARD_WIDTH_PX,
              height: PRODUCT_SESSION_ROW_CARD_HEIGHT_PX,
            }}
          >
            <div ref={portalRef} onMouseEnter={(event) => rememberPointer(event.clientX, event.clientY)} onMouseLeave={hideHover}>
              <ProductSessionRowCard {...cardProps} showDetails={isExpanded} isExpanded={isExpanded} />
            </div>
          </Box>,
          document.body,
        )}
    </>
  );
};

export { ProductSessionRow };
