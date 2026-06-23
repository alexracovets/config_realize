import type { RefObject } from 'react';

interface slidingIndicatorReturnType {
  wrapperRef: RefObject<HTMLDivElement | null>;
  getItemRef: (index: number) => (el: HTMLElement | null) => void;
  indicatorRef: RefObject<HTMLSpanElement | null>;
}

export type { slidingIndicatorReturnType };
