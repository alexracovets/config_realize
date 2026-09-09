import { CollectionPageLoader } from '@pages';

export const dynamic = 'force-dynamic';

type collectionRoutePropsType = {
  params: Promise<{ collectionHandle: string }>;
};

const CollectionRoute = async ({ params }: collectionRoutePropsType) => {
  const { collectionHandle } = await params;

  return <CollectionPageLoader collectionHandle={collectionHandle} />;
};

export default CollectionRoute;
