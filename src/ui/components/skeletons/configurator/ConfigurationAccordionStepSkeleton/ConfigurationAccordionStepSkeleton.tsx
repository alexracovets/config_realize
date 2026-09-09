'use client';

import { AtomSkeleton, Flex } from '@atoms';

import { SkeletonAccordionTrigger, SkeletonColorPalette, SkeletonRangeControl } from '@skeletons';

const ACCORDION_ITEM_COUNT = 4;

const ConfigurationAccordionStepSkeleton = ({ expandedContent = 'color' }: { expandedContent?: 'color' | 'shading' }) => {
  return (
    <Flex variant="step_design" data-testid="skeleton-step-accordion">
      <Flex variant="skeleton_column_full_gap3">
        {Array.from({ length: ACCORDION_ITEM_COUNT }, (_, index) => (
          <Flex key={index} variant="skeleton_card_column">
            <SkeletonAccordionTrigger />
            {index === 0 && (
              <Flex variant="skeleton_step_inner_column">
                <AtomSkeleton className="h-10 w-full rounded-[8px]" />
                <SkeletonColorPalette />
                {expandedContent === 'shading' && (
                  <>
                    <Flex variant="skeleton_row_center_gap3">
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
