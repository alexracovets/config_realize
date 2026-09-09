import { notFound, redirect } from 'next/navigation';

import { SHARE_CONFIG_QUERY_PARAM } from '@constants';
import { fetchSharedConfiguration } from '@shopify';

export const dynamic = 'force-dynamic';

type sharePagePropsType = {
  params: Promise<{ shareId: string }>;
};

const SharePage = async ({ params }: sharePagePropsType) => {
  const { shareId } = await params;
  const shareExport = await fetchSharedConfiguration(shareId);

  if (!shareExport) {
    notFound();
  }

  redirect(`/${shareExport.collectionHandle}/${shareExport.slug}?${SHARE_CONFIG_QUERY_PARAM}=${encodeURIComponent(shareId)}`);
};

export default SharePage;
