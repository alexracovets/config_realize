'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

import { cn } from '@utils';
import type { scrollAreaPropsType } from '@types';

const FADE_SIZE = 2;

const ScrollArea = ({ children, className, fadeEdges = false }: scrollAreaPropsType) => {
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
    if (!viewport || !fadeEdges) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const canScroll = scrollHeight > clientHeight + 1;

    setShowTopFade(canScroll && scrollTop > 4);
    setShowBottomFade(canScroll && scrollTop + clientHeight < scrollHeight - 4);
  }, [fadeEdges]);

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

    if (showTopFade && showBottomFade) {
      return `linear-gradient(to bottom, transparent 0px, #000 ${FADE_SIZE}px, #000 calc(100% - ${FADE_SIZE}px), transparent 100%)`;
    }

    if (showTopFade) {
      return `linear-gradient(to bottom, transparent 0px, #000 ${FADE_SIZE}px, #000 100%)`;
    }

    if (showBottomFade) {
      return `linear-gradient(to bottom, #000 0px, #000 calc(100% - ${FADE_SIZE}px), transparent 100%)`;
    }

    return undefined;
  }, [fadeEdges, showTopFade, showBottomFade]);

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
    <div ref={targetRef} className={cn('relative h-full w-full pr-[8px]', className)}>
      <div
        ref={viewportRef}
        className="h-full w-full overflow-y-scroll overflow-x-hidden scrollbar-none"
        style={{
          WebkitMaskImage: maskImage,
          maskImage,
        }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
};

export { ScrollArea };
