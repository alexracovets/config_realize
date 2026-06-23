'use client';

import { AtomSkeleton, Grid } from '@atoms';

const PATTERN_TILE_COUNT = 6;

const SkeletonPatternGrid = () => {
  return (
    <Grid variant="select_parts" className="min-w-0">
      <AtomSkeleton className="h-[80px] w-full rounded-[8px]" data-testid="skeleton-pattern-none" />
      {Array.from({ length: PATTERN_TILE_COUNT }, (_, index) => (
        <AtomSkeleton key={index} className="h-[80px] w-full min-w-[55px] rounded-[8px]" data-testid="skeleton-pattern-tile" />
      ))}
    </Grid>
  );
};

export { SkeletonPatternGrid };
