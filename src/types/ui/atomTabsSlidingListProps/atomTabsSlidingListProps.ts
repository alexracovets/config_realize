import type { ReactNode } from 'react';

import type { atomTabsSlidingListPresetType, slidingIndicatorTrackVariantType, slidingIndicatorVariantType } from '@types';

interface atomTabsSlidingListPropsType {
  preset?: atomTabsSlidingListPresetType;
  activeValue: string;
  className?: string;
  listClassName?: string;
  indicatorVariant?: slidingIndicatorVariantType;
  trackVariant?: slidingIndicatorTrackVariantType;
  children: ReactNode;
}

export type { atomTabsSlidingListPropsType };
