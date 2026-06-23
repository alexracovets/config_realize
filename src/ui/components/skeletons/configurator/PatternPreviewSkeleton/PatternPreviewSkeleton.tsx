'use client';

import { AtomSkeleton } from '@atoms';

const PatternPreviewSkeleton = () => {
  return <AtomSkeleton className="absolute inset-0 rounded-[6px]" data-testid="skeleton-pattern-preview" aria-label="Caricamento design" />;
};

export { PatternPreviewSkeleton };
