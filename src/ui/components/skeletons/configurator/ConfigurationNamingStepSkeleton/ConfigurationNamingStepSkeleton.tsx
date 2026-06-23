'use client';

import { AtomSkeleton, Flex } from '@atoms';

import { SkeletonAccordionTrigger, SkeletonRangeControl } from '@skeletons';

const FORM_FIELD_COUNT = 4;

const ConfigurationNamingStepSkeleton = () => {
  return (
    <Flex variant="step_design" className="gap-3" data-testid="skeleton-step-naming">
      <Flex className="w-full flex-col gap-3">
        <AtomSkeleton className="h-4 w-[220px]" />
        <AtomSkeleton className="h-10 w-full rounded-[8px]" data-testid="skeleton-position-select" />
      </Flex>
      {Array.from({ length: 2 }, (_, index) => (
        <Flex key={index} className="w-full flex-col gap-3 rounded-[8px] border border-input-border p-3">
          <SkeletonAccordionTrigger />
          {index === 0 && (
            <Flex className="w-full min-w-0 flex-col gap-3 pt-1">
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
