'use client';

import { Container } from '@atoms';
import type { collectionPagePropsType } from '@types';
import { ProductGalleryBlock } from '@molecules';

const CollectionPage = ({ collection }: collectionPagePropsType) => {
  const { title, handle, products } = collection;

  return (
    <Container className="py-12">
      <ProductGalleryBlock
        title={title}
        items={products.map((product) => ({
          collection: handle,
          slug: product.handle,
          alt: product.title,
          previewSrc: product.flipPreviewSrc,
          activePreviewSrc: product.activePreviewSrc,
        }))}
      />
    </Container>
  );
};

export { CollectionPage };
