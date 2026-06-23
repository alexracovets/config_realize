'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { AtomImage, Box, SvgIcon, Text } from '@atoms';

import { ProductSessionPreviewSkeleton } from '@skeletons';
import type { productSessionRowPropsType } from '@types';
import { cn } from '@utils';

const HOVER_TRANSITION_MS = 200;

const ProductSessionRow = ({ name, previewSrc, active = false, onSelect, onRemove }: productSessionRowPropsType) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandFramesRef = useRef<{ outer: number; inner: number } | null>(null);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverSession, setHoverSession] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const { top, left } = anchor.getBoundingClientRect();
    setPosition({ top, left });
  }, []);

  const cancelExpandFrames = useCallback(() => {
    if (!expandFramesRef.current) return;

    cancelAnimationFrame(expandFramesRef.current.outer);
    if (expandFramesRef.current.inner) cancelAnimationFrame(expandFramesRef.current.inner);
    expandFramesRef.current = null;
  }, []);

  const showHover = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    cancelExpandFrames();
    updatePosition();
    setIsExpanded(false);
    setIsHovered(true);
    setHoverSession((session) => session + 1);
  }, [cancelExpandFrames, updatePosition]);

  const hideHover = useCallback(() => {
    cancelExpandFrames();
    setIsExpanded(false);
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      collapseTimerRef.current = null;
    }, HOVER_TRANSITION_MS);
  }, [cancelExpandFrames]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      cancelExpandFrames();
    };
  }, [cancelExpandFrames]);

  useLayoutEffect(() => {
    if (!isHovered) return;

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      portalRef.current?.getBoundingClientRect();
      innerFrame = requestAnimationFrame(() => setIsExpanded(true));
      expandFramesRef.current = { outer: outerFrame, inner: innerFrame };
    });
    expandFramesRef.current = { outer: outerFrame, inner: 0 };

    return () => {
      cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
      expandFramesRef.current = null;
    };
  }, [hoverSession, isHovered]);

  useLayoutEffect(() => {
    if (!isHovered) return;

    updatePosition();

    const scrollParents: HTMLElement[] = [];
    let element = anchorRef.current?.parentElement;

    while (element) {
      const { overflowY } = getComputedStyle(element);
      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        scrollParents.push(element);
      }
      element = element.parentElement;
    }

    const onPositionChange = () => updatePosition();

    window.addEventListener('resize', onPositionChange);
    scrollParents.forEach((parent) => parent.addEventListener('scroll', onPositionChange, { passive: true }));

    return () => {
      window.removeEventListener('resize', onPositionChange);
      scrollParents.forEach((parent) => parent.removeEventListener('scroll', onPositionChange));
    };
  }, [isHovered, updatePosition]);

  const cardClassName = cn(
    'flex h-full w-full items-center overflow-hidden border border-gray-10 bg-gray-5',
    'transition-[box-shadow] duration-200 ease-out',
    active && 'border-active shadow-sm',
    isExpanded && 'shadow-md',
  );

  const cardContent = (expanded: boolean) => (
    <button
      type="button"
      onClick={onSelect}
      className={cn('flex h-full min-w-0 flex-1 items-center gap-3 px-5 py-3 cursor-pointer', active && 'cursor-default')}
    >
      <div className="relative h-[60px] w-[40px] shrink-0">
        {!isPreviewLoaded && <ProductSessionPreviewSkeleton />}
        <AtomImage
          src={previewSrc}
          alt={name}
          className={cn('h-full w-full object-contain', !isPreviewLoaded && 'opacity-0')}
          onLoad={() => setIsPreviewLoaded(true)}
        />
      </div>
      <Text
        className={cn(
          'min-w-0 flex-1 truncate text-left text-[14px] font-medium transition-opacity duration-200',
          expanded ? 'w-auto opacity-100' : 'w-0 opacity-0',
        )}
      >
        {name}
      </Text>
      <Box
        className={cn('cursor-pointer bg-transparent transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0')}
        onClick={onRemove}
        aria-label={`Rimuovi ${name}`}
      >
        <SvgIcon name="delete" className="text-error" />
      </Box>
    </button>
  );

  return (
    <>
      <div ref={anchorRef} className={cn('relative h-[64px] w-[92px]', isHovered && 'invisible')} onMouseEnter={showHover}>
        <div data-active={active} className={cardClassName}>
          {cardContent(false)}
        </div>
      </div>
      {isHovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={portalRef}
            className={cn('fixed z-50 h-[64px] transition-[width,box-shadow] duration-200 ease-out', isExpanded ? 'w-[260px]' : 'w-[92px]')}
            style={{ top: position.top, left: position.left }}
            onMouseLeave={hideHover}
          >
            <div data-active={active} className={cardClassName}>
              {cardContent(isExpanded)}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export { ProductSessionRow };
