'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PRODUCT_SESSION_ROW_HOVER_TRANSITION_MS } from './productSessionRow.constants';
import { claimProductSessionHover, releaseProductSessionHover } from './productSessionRowHoverRegistry';

const findScrollableParents = (anchor: HTMLElement | null) => {
  const scrollParents: HTMLElement[] = [];
  let element = anchor?.parentElement ?? null;

  while (element) {
    const { overflowY } = getComputedStyle(element);

    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      scrollParents.push(element);
    }

    element = element.parentElement;
  }

  return scrollParents;
};

const findScrollViewport = (anchor: HTMLElement | null) => {
  let element = anchor?.parentElement ?? null;

  while (element) {
    const { overflowY } = getComputedStyle(element);

    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return element;
    }

    element = element.parentElement;
  }

  return null;
};

const useProductSessionRowHover = () => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandFramesRef = useRef<{ outer: number; inner: number } | null>(null);
  const hoverOwnerRef = useRef<object>({});
  const pointerRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverSession, setHoverSession] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const rememberPointer = useCallback((clientX: number, clientY: number) => {
    pointerRef.current = { x: clientX, y: clientY };
  }, []);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const { top, left } = anchor.getBoundingClientRect();
    setPosition({ top, left });
  }, []);

  const cancelExpandFrames = useCallback(() => {
    if (!expandFramesRef.current) return;

    cancelAnimationFrame(expandFramesRef.current.outer);

    if (expandFramesRef.current.inner) {
      cancelAnimationFrame(expandFramesRef.current.inner);
    }

    expandFramesRef.current = null;
  }, []);

  const ensureAnchorVisibleInScrollViewport = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    anchor.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    updatePosition();
  }, [updatePosition]);

  const stableDismissHover = useCallback(() => {
    cancelExpandFrames();

    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    setIsExpanded(false);
    setIsHovered(false);
    releaseProductSessionHover(hoverOwnerRef.current);
  }, [cancelExpandFrames]);

  const isPointerOverPortal = useCallback(() => {
    const portal = portalRef.current;
    if (!portal) return false;

    const { x, y } = pointerRef.current;
    const rect = portal.getBoundingClientRect();

    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }, []);

  const syncHoverWithPointer = useCallback(() => {
    if (!isHoveredRef.current) return;
    if (!isPointerOverPortal()) stableDismissHover();
  }, [isPointerOverPortal, stableDismissHover]);

  const showHover = useCallback(
    (clientX: number, clientY: number) => {
      rememberPointer(clientX, clientY);
      claimProductSessionHover(hoverOwnerRef.current, stableDismissHover);

      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }

      cancelExpandFrames();
      updatePosition();
      setIsExpanded(false);
      setIsHovered(true);
      setHoverSession((session) => session + 1);
    },
    [cancelExpandFrames, rememberPointer, stableDismissHover, updatePosition],
  );

  const hideHover = useCallback(() => {
    cancelExpandFrames();
    setIsExpanded(false);

    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      collapseTimerRef.current = null;
      releaseProductSessionHover(hoverOwnerRef.current);
    }, PRODUCT_SESSION_ROW_HOVER_TRANSITION_MS);
  }, [cancelExpandFrames]);

  useEffect(() => {
    const hoverOwner = hoverOwnerRef.current;

    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      cancelExpandFrames();
      releaseProductSessionHover(hoverOwner);
    };
  }, [cancelExpandFrames]);

  useEffect(() => {
    if (!isHovered) return;

    const onPointerMove = (event: PointerEvent) => {
      rememberPointer(event.clientX, event.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [isHovered, rememberPointer]);

  useLayoutEffect(() => {
    if (!isHovered) return;

    ensureAnchorVisibleInScrollViewport();
  }, [ensureAnchorVisibleInScrollViewport, hoverSession, isHovered]);

  useLayoutEffect(() => {
    if (!isExpanded) return;

    ensureAnchorVisibleInScrollViewport();
    updatePosition();
  }, [ensureAnchorVisibleInScrollViewport, isExpanded, updatePosition]);

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

    const scrollParents = findScrollableParents(anchorRef.current);

    const onPositionChange = () => {
      updatePosition();
      requestAnimationFrame(syncHoverWithPointer);
    };

    window.addEventListener('resize', onPositionChange);
    scrollParents.forEach((parent) => parent.addEventListener('scroll', onPositionChange, { passive: true }));

    return () => {
      window.removeEventListener('resize', onPositionChange);
      scrollParents.forEach((parent) => parent.removeEventListener('scroll', onPositionChange));
    };
  }, [isHovered, syncHoverWithPointer, updatePosition]);

  useEffect(() => {
    if (!isHovered) return;

    const portal = portalRef.current;
    if (!portal) return;

    const onWheel = (event: WheelEvent) => {
      const scrollViewport = findScrollViewport(anchorRef.current);
      if (!scrollViewport) return;

      scrollViewport.scrollTop += event.deltaY;
      event.preventDefault();
      requestAnimationFrame(syncHoverWithPointer);
    };

    portal.addEventListener('wheel', onWheel, { passive: false });

    return () => portal.removeEventListener('wheel', onWheel);
  }, [isHovered, syncHoverWithPointer]);

  return {
    anchorRef,
    portalRef,
    isHovered,
    isExpanded,
    position,
    showHover,
    hideHover,
    rememberPointer,
  };
};

export { useProductSessionRowHover };
