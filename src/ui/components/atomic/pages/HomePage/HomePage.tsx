'use client';

import { Container } from '@atoms';
import type { homePagePropsType } from '@types';
import { ProductGalleryBlock } from '@molecules';

const HomePage = ({ collections }: homePagePropsType) => {
  return (
    <Container className="flex flex-col gap-25 py-12">
      {collections.map(({ id, title, handle, products }) => (
        <ProductGalleryBlock
          key={id}
          title={title}
          items={products.map((product) => ({
            collection: handle,
            slug: product.modelId ?? product.handle,
            alt: product.title,
            previewSrc: product.previewSrc,
            activePreviewSrc: product.activePreviewSrc,
          }))}
        />
      ))}
    </Container>
  );
};

export { HomePage };
