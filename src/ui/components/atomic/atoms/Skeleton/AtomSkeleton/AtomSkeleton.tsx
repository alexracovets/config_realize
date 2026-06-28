'use client';

import type { atomSkeletonPropsType } from '@types';
import { cn } from '@utils';

const AtomSkeleton = ({ className, ...props }: atomSkeletonPropsType) => {
  return <div aria-hidden data-slot="skeleton" className={cn('animate-pulse rounded-md bg-gray-20', className)} {...props} />;
};

export { AtomSkeleton };
