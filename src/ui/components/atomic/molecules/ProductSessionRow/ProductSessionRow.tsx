'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

import { Box } from '@atoms';

import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';

import { ProductSessionRowCard } from '@molecules/ProductSessionRow/ProductSessionRowCard';
import { PRODUCT_SESSION_ROW_SCROLL_EDGE_PADDING_PX } from '@molecules/ProductSessionRow/productSessionRowConstants';
import { useProductSessionRowHover } from '@molecules/ProductSessionRow/useProductSessionRowHover';

const ProductSessionRow = ({ name, previewSrc, active = false, onSelect, onRemove }: productSessionRowPropsType) => {
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const { anchorRef, portalRef, isPortalVisible, isAnchorHidden, isExpanded, position, showHover, hideHover, rememberPointer } = useProductSessionRowHover();

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
        className={cn(
          'relative shrink-0 overflow-hidden w-15 h-12 max-sm:w-12 max-sm:h-11',
          isAnchorHidden && 'invisible',
        )}
        style={{
          scrollMarginTop: PRODUCT_SESSION_ROW_SCROLL_EDGE_PADDING_PX,
          scrollMarginBottom: PRODUCT_SESSION_ROW_SCROLL_EDGE_PADDING_PX,
        }}
      >
        <div ref={anchorRef} onMouseEnter={(event) => showHover(event.clientX, event.clientY)}>
          <ProductSessionRowCard {...cardProps} variant="anchor" isExpanded={false} />
        </div>
      </Box>
      {isPortalVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <Box
            asChild
            className={cn(
              'fixed z-50 overflow-hidden transition-[width,box-shadow] duration-200 ease-out',
              'h-12 max-sm:h-11',
              isExpanded ? 'w-65' : 'w-15 max-sm:w-12',
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div ref={portalRef} onMouseEnter={(event) => rememberPointer(event.clientX, event.clientY)} onMouseLeave={hideHover}>
              <ProductSessionRowCard {...cardProps} variant="portal" isExpanded={isExpanded} />
            </div>
          </Box>,
          document.body,
        )}
    </>
  );
};

export { ProductSessionRow };
