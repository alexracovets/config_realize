'use client';

import type { productGalleryBlockPropsType } from '@types';
import { Grid, Text } from '@atoms';
import { ProductFlipCard } from '@molecules/ProductFlipCard';
import { cn } from '@utils';
const ProductGalleryBlock = ({ title, items, className }: productGalleryBlockPropsType) => {
  return (
    <section className={cn('w-full', className)}>
      <Text variant="h2">{title}</Text>
      <Grid className="grid-cols-4 gap-6">
        {items.map(({ collection, slug, alt, previewSrc, activePreviewSrc }) => (
          <ProductFlipCard
            key={`${collection}-${slug}`}
            collection={collection}
            slug={slug}
            alt={alt}
            previewSrc={previewSrc}
            activePreviewSrc={activePreviewSrc}
          />
        ))}
      </Grid>
    </section>
  );
};

export { ProductGalleryBlock };
