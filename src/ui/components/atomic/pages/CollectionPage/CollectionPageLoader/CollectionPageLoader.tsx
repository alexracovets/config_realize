import { notFound } from 'next/navigation';

import { CollectionPage } from '@pages';
import { resolveHomeCollectionByHandle } from '@shopify';

type collectionPageLoaderPropsType = {
  collectionHandle: string;
};

const CollectionPageLoader = async ({ collectionHandle }: collectionPageLoaderPropsType) => {
  const collection = await resolveHomeCollectionByHandle(collectionHandle);

  if (!collection) {
    notFound();
  }

  return <CollectionPage collection={collection} />;
};

export { CollectionPageLoader };
