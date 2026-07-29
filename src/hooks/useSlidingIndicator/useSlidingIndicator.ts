'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

import type { slidingIndicatorReturnType } from '@types';

const useSlidingIndicator = (activeIndex: number, options?: { scrollIntoView?: boolean }): slidingIndicatorReturnType => {
  const shouldScrollIntoView = options?.scrollIntoView ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  const updateIndicator = useCallback(() => {
    const wrapper = wrapperRef.current;
    const element = itemRefs.current[activeIndex];
    const indicator = indicatorRef.current;

    if (!wrapper || !element || !indicator) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    indicator.style.transform = `translateX(${elementRect.left - wrapperRect.left}px)`;
    indicator.style.width = `${elementRect.width}px`;
  }, [activeIndex]);

  const getItemRef = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      itemRefs.current[index] = element;

      if (element) {
        requestAnimationFrame(updateIndicator);
      }
    },
    [updateIndicator],
  );

  const isFirstScrollRef = useRef(true);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useLayoutEffect(() => {
    if (!shouldScrollIntoView) return;

    const element = itemRefs.current[activeIndex];
    if (!element) return;

    let scrollContainer: HTMLElement | null = element.parentElement;
    while (scrollContainer) {
      const { overflowX } = getComputedStyle(scrollContainer);
      if ((overflowX === 'auto' || overflowX === 'scroll') && scrollContainer.scrollWidth > scrollContainer.clientWidth) break;
      scrollContainer = scrollContainer.parentElement;
    }
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const elementCenterOffset = elementRect.left - containerRect.left + elementRect.width / 2 - containerRect.width / 2;
    const targetScrollLeft = Math.max(
      0,
      Math.min(scrollContainer.scrollLeft + elementCenterOffset, scrollContainer.scrollWidth - scrollContainer.clientWidth),
    );

    scrollContainer.scrollTo({ left: targetScrollLeft, behavior: isFirstScrollRef.current ? 'auto' : 'smooth' });
    isFirstScrollRef.current = false;
  }, [activeIndex, shouldScrollIntoView]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(wrapper);

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    window.addEventListener('resize', updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator, activeIndex]);

  return { wrapperRef, getItemRef, indicatorRef };
};

export { useSlidingIndicator };
