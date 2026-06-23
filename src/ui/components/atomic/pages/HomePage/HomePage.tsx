'use client';

import { Container } from '@atoms';
import { HOME_PRODUCT_GALLERY_BLOCKS } from '@constants';
import { ProductGalleryBlock } from '@molecules';

const HomePage = () => {
  return (
    <Container className="flex flex-col gap-25 py-12">
      {HOME_PRODUCT_GALLERY_BLOCKS.map(({ id, title, items }) => (
        <ProductGalleryBlock key={id} title={title} items={items} />
      ))}
    </Container>
  );
};

export { HomePage };
