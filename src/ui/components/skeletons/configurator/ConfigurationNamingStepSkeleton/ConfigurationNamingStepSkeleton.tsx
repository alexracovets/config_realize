'use client';

import { AtomSkeleton, Flex } from '@atoms';

import { SkeletonAccordionTrigger, SkeletonRangeControl } from '@skeletons';

const FORM_FIELD_COUNT = 4;

const ConfigurationNamingStepSkeleton = () => {
  return (
    <Flex variant="step_design_compact" data-testid="skeleton-step-naming">
      <Flex variant="skeleton_column_full_gap3">
        <AtomSkeleton className="h-4 w-[220px]" />
        <AtomSkeleton className="h-10 w-full rounded-[8px]" data-testid="skeleton-position-select" />
      </Flex>
      {Array.from({ length: 2 }, (_, index) => (
        <Flex key={index} variant="skeleton_card_column">
          <SkeletonAccordionTrigger />
          {index === 0 && (
            <Flex variant="skeleton_inner_column">
              <AtomSkeleton className="h-10 w-full rounded-[8px]" />
              <AtomSkeleton className="h-10 w-full rounded-[8px]" />
              <AtomSkeleton className="h-10 w-full rounded-[8px]" />
              {Array.from({ length: FORM_FIELD_COUNT }, (__, fieldIndex) => (
                <SkeletonRangeControl key={fieldIndex} />
              ))}
              <AtomSkeleton className="h-[28px] w-24" />
            </Flex>
          )}
        </Flex>
      ))}
    </Flex>
  );
};

export { ConfigurationNamingStepSkeleton };
