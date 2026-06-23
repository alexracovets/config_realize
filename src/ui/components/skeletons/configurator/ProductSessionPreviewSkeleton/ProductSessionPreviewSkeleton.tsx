'use client';

import { AtomSkeleton } from '@atoms';

const ProductSessionPreviewSkeleton = () => {
  return <AtomSkeleton className="absolute inset-0 rounded-none" data-testid="skeleton-product-preview" aria-label="Caricamento anteprima" />;
};

export { ProductSessionPreviewSkeleton };
