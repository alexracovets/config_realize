'use client';

import { AtomSkeleton, Flex } from '@atoms';

const SkeletonAccordionTrigger = () => {
  return (
    <Flex variant="skeleton_row_center_gap2">
      <AtomSkeleton className="size-5 shrink-0 rounded-[3px]" />
      <AtomSkeleton className="h-4 w-28" />
    </Flex>
  );
};

export { SkeletonAccordionTrigger };
