'use client';

import { forwardRef } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@utils';
import type { slidingIndicatorPropsType, slidingIndicatorTrackPropsType } from '@types';

const slidingIndicatorVariants = cva(
  'absolute bottom-0 left-0 pointer-events-none will-change-transform transition-[transform,width] duration-300 ease-in-out',
  {
    variants: {
      variant: {
        gradient: 'h-[4px] bg-linear-to-r from-[#ECD187] via-[#CC2967] to-[#030102]',
        solid: 'z-[1] h-[2px] bg-default',
      },
    },
    defaultVariants: {
      variant: 'gradient',
    },
  },
);

const slidingIndicatorTrackVariants = cva('absolute bottom-0 left-0 right-0 pointer-events-none', {
  variants: {
    variant: {
      default: 'h-[2px] bg-gray-30',
      none: 'hidden',
    },
  },
  defaultVariants: {
    variant: 'none',
  },
});

const SlidingIndicator = forwardRef<HTMLSpanElement, slidingIndicatorPropsType>(({ className, variant, ...props }, ref) => {
  return <span ref={ref} aria-hidden className={cn(slidingIndicatorVariants({ variant }), className)} {...props} />;
});

SlidingIndicator.displayName = 'SlidingIndicator';

const SlidingIndicatorTrack = ({ className, variant, ...props }: slidingIndicatorTrackPropsType) => {
  return <span aria-hidden className={cn(slidingIndicatorTrackVariants({ variant }), className)} {...props} />;
};

export { SlidingIndicator, SlidingIndicatorTrack, slidingIndicatorTrackVariants, slidingIndicatorVariants };
