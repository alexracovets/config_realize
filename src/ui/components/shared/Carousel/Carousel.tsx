'use client';

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ImArrowLeft, ImArrowRight } from 'react-icons/im';

import { Button } from '@atoms';
import { cn } from '@utils';

type carouselApiType = UseEmblaCarouselType[1];
type useCarouselParametersType = Parameters<typeof useEmblaCarousel>;
type carouselOptionsType = useCarouselParametersType[0];
type carouselPluginType = useCarouselParametersType[1];

type carouselPropsType = {
  opts?: carouselOptionsType;
  plugins?: carouselPluginType;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: carouselApiType) => void;
};

type carouselContextPropsType = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & carouselPropsType;

const CarouselContext = createContext<carouselContextPropsType | null>(null);

const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
};

const Carousel = ({ orientation = 'horizontal', opts, setApi, plugins, className, children, ...props }: React.ComponentProps<'div'> & carouselPropsType) => {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' }, plugins);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!api) return () => {};

      api.on('reInit', callback);
      api.on('select', callback);

      return () => {
        api.off('reInit', callback);
        api.off('select', callback);
      };
    },
    [api],
  );

  const canScrollPrev = useSyncExternalStore(subscribe, () => api?.canScrollPrev() ?? false, () => false);
  const canScrollNext = useSyncExternalStore(subscribe, () => api?.canScrollNext() ?? false, () => false);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative min-w-0', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

const CarouselContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
      style={{ touchAction: orientation === 'horizontal' ? 'pan-y' : 'pan-x' }}
    >
      <div className={cn('flex', orientation === 'horizontal' ? '-ml-2' : '-mt-2 flex-col', className)} {...props} />
    </div>
  );
};

const CarouselItem = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-2' : 'pt-2', className)}
      {...props}
    />
  );
};

const CarouselPrevious = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'absolute touch-manipulation rounded-full',
        orientation === 'horizontal' ? 'inset-y-0 -left-10 my-auto' : '-top-10 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ImArrowLeft className="size-4" />
      <span className="sr-only">Precedente</span>
    </Button>
  );
};

const CarouselNext = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'absolute touch-manipulation rounded-full',
        orientation === 'horizontal' ? 'inset-y-0 -right-10 my-auto' : '-bottom-10 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ImArrowRight className="size-4" />
      <span className="sr-only">Successivo</span>
    </Button>
  );
};

export { type carouselApiType, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel };
