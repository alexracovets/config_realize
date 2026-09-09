'use client';

import { AtomSkeleton, Flex } from '@atoms';

const SkeletonRangeControl = () => {
  return (
    <Flex variant="skeleton_column_full_gap2">
      <AtomSkeleton className="h-4 w-24" />
      <AtomSkeleton className="h-4 w-full rounded-full" />
    </Flex>
  );
};

export { SkeletonRangeControl };
