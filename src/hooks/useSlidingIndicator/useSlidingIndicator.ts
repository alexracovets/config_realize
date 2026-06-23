'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

import type { slidingIndicatorReturnType } from '@types';

const useSlidingIndicator = (activeIndex: number): slidingIndicatorReturnType => {
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

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

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
