'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

import { cn } from '@utils';
import type { scrollAreaPropsType } from '@types';

const FADE_SIZE = 3;
const EDGE_SHADOW_SIZE = 24;

const ScrollArea = ({ children, className, fadeEdges = false, edgeShadows = false, orientation = 'vertical' }: scrollAreaPropsType) => {
  const isHorizontal = orientation === 'horizontal';
  const targetRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<OverlayScrollbars | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(fadeEdges);

  const updateFade = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || (!fadeEdges && !edgeShadows)) return;

    if (isHorizontal) {
      const { scrollLeft, scrollWidth, clientWidth } = viewport;
      const canScroll = scrollWidth > clientWidth + 1;

      setShowTopFade(canScroll && scrollLeft > 4);
      setShowBottomFade(canScroll && scrollLeft + clientWidth < scrollWidth - 4);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const canScroll = scrollHeight > clientHeight + 1;

    setShowTopFade(canScroll && scrollTop > 4);
    setShowBottomFade(canScroll && scrollTop + clientHeight < scrollHeight - 4);
  }, [fadeEdges, edgeShadows, isHorizontal]);

  const updateScrollbarPadding = useCallback(() => {
    if (!instanceRef.current) return;
    instanceRef.current.update(true);
  }, []);

  const refresh = useCallback(() => {
    updateFade();
    if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);

    frameIdRef.current = requestAnimationFrame(() => {
      frameIdRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(updateScrollbarPadding, 150);
    });
  }, [updateFade, updateScrollbarPadding]);

  const maskImage = useMemo(() => {
    if (!fadeEdges) return undefined;

    const direction = isHorizontal ? 'to right' : 'to bottom';

    if (showTopFade && showBottomFade) {
      return `linear-gradient(${direction}, transparent 0px, #000 ${FADE_SIZE}px, #000 calc(100% - ${FADE_SIZE}px), transparent 100%)`;
    }

    if (showTopFade) {
      return `linear-gradient(${direction}, transparent 0px, #000 ${FADE_SIZE}px, #000 100%)`;
    }

    if (showBottomFade) {
      return `linear-gradient(${direction}, #000 0px, #000 calc(100% - ${FADE_SIZE}px), transparent 100%)`;
    }

    return undefined;
  }, [fadeEdges, isHorizontal, showTopFade, showBottomFade]);

  useLayoutEffect(() => {
    updateFade();
  }, [updateFade, children]);

  useEffect(() => {
    if (!targetRef.current || !viewportRef.current || !contentRef.current) return;

    const instance = OverlayScrollbars(
      {
        target: targetRef.current,
        elements: {
          viewport: viewportRef.current,
          content: contentRef.current,
        },
      },
      {
        scrollbars: {
          theme: 'os-theme-custom',
          visibility: 'auto',
        },
      },
    );

    instanceRef.current = instance;

    const ro = new ResizeObserver(refresh);
    ro.observe(contentRef.current);
    ro.observe(viewportRef.current);

    const viewport = viewportRef.current;
    const onScroll = () => updateFade();

    viewport.addEventListener('scroll', onScroll, { passive: true });
    updateFade();
    refresh();

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
      ro.disconnect();
      instance.destroy();
      instanceRef.current = null;
    };
  }, [refresh, updateFade]);

  return (
    <div
      ref={targetRef}
      className={cn('relative w-full', isHorizontal ? 'pb-2' : 'h-full pr-2', className)}
    >
      <div
        ref={viewportRef}
        className={cn(
          'w-full scrollbar-none',
          isHorizontal ? 'overflow-x-scroll overflow-y-hidden' : 'h-full overflow-y-scroll overflow-x-hidden',
        )}
        style={{
          WebkitMaskImage: maskImage,
          maskImage,
        }}
      >
        <div ref={contentRef} className={cn(isHorizontal && 'w-fit')}>
          {children}
        </div>
      </div>

      {edgeShadows && (
        <>
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute z-10 transition-opacity duration-150',
              isHorizontal
                ? 'inset-y-0 left-0 bg-linear-to-r from-white to-transparent'
                : 'inset-x-0 top-0 bg-linear-to-b from-white to-transparent',
              showTopFade ? 'opacity-100' : 'opacity-0',
            )}
            style={isHorizontal ? { width: EDGE_SHADOW_SIZE } : { height: EDGE_SHADOW_SIZE }}
          />
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute z-10 transition-opacity duration-150',
              isHorizontal
                ? 'inset-y-0 right-0 bg-linear-to-l from-white to-transparent'
                : 'inset-x-0 bottom-0 bg-linear-to-t from-white to-transparent',
              showBottomFade ? 'opacity-100' : 'opacity-0',
            )}
            style={isHorizontal ? { width: EDGE_SHADOW_SIZE } : { height: EDGE_SHADOW_SIZE }}
          />
        </>
      )}
    </div>
  );
};

export { ScrollArea };
