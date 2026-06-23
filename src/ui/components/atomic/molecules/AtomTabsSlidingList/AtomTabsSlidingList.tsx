'use client';

import { Children, cloneElement, isValidElement, type ReactElement, type RefAttributes, useMemo } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { AtomTabsList, SlidingIndicator, SlidingIndicatorTrack, slidingIndicatorTrackVariants, slidingIndicatorVariants } from '@atoms';
import { useSlidingIndicator } from '@hooks';
import type { atomTabsSlidingListPropsType } from '@types';
import { cn } from '@utils';

const atomTabsSlidingListVariants = cva('relative', {
  variants: {
    preset: {
      configurator: 'w-fit pt-2',
      modal: 'w-fit',
    },
  },
  defaultVariants: {
    preset: 'modal',
  },
});

const slidingListPresetMap = {
  configurator: {
    indicatorVariant: 'gradient',
    trackVariant: 'none',
  },
  modal: {
    indicatorVariant: 'solid',
    trackVariant: 'default',
  },
} as const satisfies Record<
  NonNullable<VariantProps<typeof atomTabsSlidingListVariants>['preset']>,
  {
    indicatorVariant: NonNullable<VariantProps<typeof slidingIndicatorVariants>['variant']>;
    trackVariant: NonNullable<VariantProps<typeof slidingIndicatorTrackVariants>['variant']>;
  }
>;

const AtomTabsSlidingList = ({
  activeValue,
  preset = 'modal',
  className,
  listClassName,
  indicatorVariant: indicatorVariantProp,
  trackVariant: trackVariantProp,
  children,
}: atomTabsSlidingListPropsType) => {
  const presetStyles = slidingListPresetMap[preset ?? 'modal'];
  const indicatorVariant = indicatorVariantProp ?? presetStyles.indicatorVariant;
  const trackVariant = trackVariantProp ?? presetStyles.trackVariant;

  const triggers = useMemo(
    () => Children.toArray(children).filter((child): child is ReactElement<{ value?: string } & RefAttributes<HTMLButtonElement>> => isValidElement(child)),
    [children],
  );

  const activeIndex = useMemo(() => {
    const index = triggers.findIndex((child) => child.props.value === activeValue);
    return index === -1 ? 0 : index;
  }, [triggers, activeValue]);

  const { wrapperRef, getItemRef, indicatorRef } = useSlidingIndicator(activeIndex);

  return (
    <div ref={wrapperRef} className={cn(atomTabsSlidingListVariants({ preset }), className)}>
      <AtomTabsList className={listClassName}>
        {triggers.map((child, index) =>
          cloneElement(child, {
            key: String(child.props.value ?? index),
            ref: getItemRef(index),
          }),
        )}
      </AtomTabsList>

      <SlidingIndicatorTrack variant={trackVariant} />
      <SlidingIndicator ref={indicatorRef} variant={indicatorVariant} />
    </div>
  );
};

export { AtomTabsSlidingList, atomTabsSlidingListVariants };
