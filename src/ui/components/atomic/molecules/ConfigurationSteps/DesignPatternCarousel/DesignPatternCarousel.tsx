'use client';

import { useEffect, useRef } from 'react';

import type { designPatternItemType } from '@types';
import { SvgIcon } from '@atoms';
import { Carousel, CarouselContent, CarouselItem, type carouselApiType } from '@shared';
import { cn } from '@utils';

type designPatternCarouselPropsType = {
  patterns: designPatternItemType[];
  activePatternKey: string | null;
  onSelect: (pattern: designPatternItemType | null) => void;
  renderPreview: (pattern: designPatternItemType, index: number) => React.ReactNode;
};

const CAROUSEL_OPTS = { align: 'center', dragFree: true, containScroll: 'keepSnaps', watchResize: false } as const;

const DesignPatternCarousel = ({ patterns, activePatternKey, onSelect, renderPreview }: designPatternCarouselPropsType) => {
  const apiRef = useRef<carouselApiType | null>(null);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const index = activePatternKey === null ? 0 : patterns.findIndex((pattern) => pattern.key === activePatternKey) + 1;
    if (index === -1) return;

    api.scrollTo(index);
  }, [activePatternKey, patterns]);

  return (
    <Carousel opts={CAROUSEL_OPTS} setApi={(api) => (apiRef.current = api ?? null)} className="w-full">
      <CarouselContent className="-ml-1.5 items-center py-1.5 h-16.75 will-change-transform">
        <CarouselItem className="basis-auto pl-1.5 contain-[layout_paint]">
          <button
            type="button"
            title="Nessuno"
            aria-pressed={activePatternKey === null}
            onClick={() => onSelect(null)}
            className={cn(
              'relative w-7.5 h-10 shrink-0 rounded-lg border border-gray-30 bg-gray-5 cursor-pointer overflow-hidden',
              'transition-[width,height,box-shadow,border-color] duration-200 ease-in',
              activePatternKey === null && 'w-10.5 h-13.75 border-active shadow-md',
            )}
          >
            <SvgIcon name="none" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4" />
          </button>
        </CarouselItem>
        {patterns.map((pattern, index) => {
          const isActive = pattern.key === activePatternKey;

          return (
            <CarouselItem key={pattern.key} className="basis-auto pl-1.5 contain-[layout_paint]">
              <button
                type="button"
                title={pattern.name}
                aria-pressed={isActive}
                onClick={() => onSelect(pattern)}
                className={cn(
                  'w-7.5 h-10 shrink-0 overflow-hidden rounded-lg border border-gray-30 cursor-pointer',
                  'transition-[width,height,box-shadow,border-color] duration-200 ease-in',
                  isActive && 'w-10.5 h-13.75 border-active shadow-md',
                )}
              >
                {renderPreview(pattern, index)}
              </button>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};

export { DesignPatternCarousel };
