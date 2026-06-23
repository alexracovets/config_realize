'use client';

import { AtomSkeleton, Flex } from '@atoms';

import { SkeletonAccordionTrigger, SkeletonColorPalette, SkeletonRangeControl } from '@skeletons';

const ACCORDION_ITEM_COUNT = 4;

const ConfigurationAccordionStepSkeleton = ({ expandedContent = 'color' }: { expandedContent?: 'color' | 'shading' }) => {
  return (
    <Flex variant="step_design" data-testid="skeleton-step-accordion">
      <Flex className="w-full flex-col gap-3">
        {Array.from({ length: ACCORDION_ITEM_COUNT }, (_, index) => (
          <Flex key={index} className="w-full flex-col gap-3 rounded-[8px] border border-input-border p-3">
            <SkeletonAccordionTrigger />
            {index === 0 && (
              <Flex className="w-full min-w-0 flex-col gap-5 pt-1">
                <AtomSkeleton className="h-10 w-full rounded-[8px]" />
                <SkeletonColorPalette />
                {expandedContent === 'shading' && (
                  <>
                    <Flex className="items-center gap-3">
                      <AtomSkeleton className="h-5 w-10 rounded-full" />
                      <AtomSkeleton className="size-10 rounded-[3px]" />
                    </Flex>
                    <SkeletonRangeControl />
                    <SkeletonRangeControl />
                    <SkeletonRangeControl />
                  </>
                )}
              </Flex>
            )}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export { ConfigurationAccordionStepSkeleton };
