'use client';

import {
  ConfigurationAccordionStepSkeleton,
  ConfigurationDesignStepSkeleton,
  ConfigurationLogoStepSkeleton,
  ConfigurationNamingStepSkeleton,
} from '@skeletons';
import type { configurationStepSkeletonPropsType } from '@types';

const ConfigurationStepSkeleton = ({ step }: configurationStepSkeletonPropsType) => {
  switch (step) {
    case 1:
      return <ConfigurationAccordionStepSkeleton expandedContent="color" />;
    case 2:
      return <ConfigurationDesignStepSkeleton />;
    case 3:
      return <ConfigurationAccordionStepSkeleton expandedContent="shading" />;
    case 4:
    case 5:
      return <ConfigurationNamingStepSkeleton />;
    case 6:
      return <ConfigurationNamingStepSkeleton />;
    case 7:
      return <ConfigurationLogoStepSkeleton />;
    default:
      return null;
  }
};

export { ConfigurationStepSkeleton };
