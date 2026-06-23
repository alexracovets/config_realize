'use client';

import { AtomSkeleton, Flex } from '@atoms';

const SkeletonAccordionTrigger = () => {
  return (
    <Flex className="items-center gap-2">
      <AtomSkeleton className="size-5 shrink-0 rounded-[3px]" />
      <AtomSkeleton className="h-4 w-28" />
    </Flex>
  );
};

export { SkeletonAccordionTrigger };
