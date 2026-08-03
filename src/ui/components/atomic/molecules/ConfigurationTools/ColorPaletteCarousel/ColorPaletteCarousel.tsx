'use client';

import { useEffect, useRef } from 'react';

import { Carousel, type carouselApiType, CarouselContent, CarouselItem } from '@shared';
import { PALETTE_COLORS } from '@constants';
import { cn } from '@utils';

type colorPaletteCarouselPropsType = {
  color: string;
  onSelect?: (color: string) => void;
  colors?: readonly string[];
};

const CAROUSEL_OPTS = { align: 'center', dragFree: true, containScroll: 'keepSnaps', watchResize: false } as const;

const ColorPaletteCarousel = ({ color, onSelect, colors = PALETTE_COLORS }: colorPaletteCarouselPropsType) => {
  const apiRef = useRef<carouselApiType | null>(null);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const index = colors.indexOf(color);
    if (index === -1) return;

    api.scrollTo(index, false);
  }, [color, colors]);

  return (
    <Carousel opts={CAROUSEL_OPTS} setApi={(api) => (apiRef.current = api ?? null)} className="w-full">
      <CarouselContent className="-ml-1.5 items-center py-1.5 h-12 will-change-transform">
        {colors.map((paletteColor) => {
          const isActive = color === paletteColor;

          return (
            <CarouselItem key={paletteColor} className="basis-auto pl-1.5 contain-[layout_paint]">
              <button
                type="button"
                aria-label={paletteColor}
                aria-pressed={isActive}
                onClick={() => onSelect?.(paletteColor)}
                className={cn(
                  'size-7.5 shrink-0 rounded-lg border border-gray-30 shadow-sm transition-[width,height,box-shadow,border-color] duration-200 ease-in cursor-pointer',
                  isActive && 'size-10.5 shadow-md border-active',
                )}
                style={{ backgroundColor: paletteColor }}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};

export { ColorPaletteCarousel };
