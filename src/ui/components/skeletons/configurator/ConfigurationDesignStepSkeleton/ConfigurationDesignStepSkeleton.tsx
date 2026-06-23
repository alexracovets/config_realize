'use client';

import { AtomSkeleton, Flex } from '@atoms';

import { SkeletonColorPalette, SkeletonPatternGrid, SkeletonRangeControl } from '@skeletons';

const ConfigurationDesignStepSkeleton = () => {
  return (
    <Flex variant="step_design" data-testid="skeleton-step-design">
      <SkeletonPatternGrid />
      <Flex className="w-full flex-col gap-3">
        <AtomSkeleton className="h-4 w-28" />
        <AtomSkeleton className="h-10 w-full rounded-[8px]" />
        <SkeletonColorPalette />
      </Flex>
      <SkeletonRangeControl />
    </Flex>
  );
};

export { ConfigurationDesignStepSkeleton };
