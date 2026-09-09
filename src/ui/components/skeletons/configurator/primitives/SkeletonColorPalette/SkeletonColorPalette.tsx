'use client';

import { AtomSkeleton, Grid } from '@atoms';

import { PALETTE_COLORS } from '@constants';

const SkeletonColorPalette = () => {
  return (
    <Grid variant="select_parts_minw0">
      {PALETTE_COLORS.map((_, index) => (
        <AtomSkeleton key={index} className="h-[60px] w-full rounded-[8px]" />
      ))}
    </Grid>
  );
};

export { SkeletonColorPalette };
