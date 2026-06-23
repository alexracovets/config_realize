type productFlipCardSideType = 'front' | 'back';

const resolveProductFlipCardSrc = (collection: string, slug: string, side: productFlipCardSideType = 'front') => {
  const fileName = side === 'front' ? slug : `${slug}_active`;

  return `/png/products/${collection}/${slug}/${fileName}.png`;
};

export type { productFlipCardSideType };
export { resolveProductFlipCardSrc };
