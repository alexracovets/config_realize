import { headers } from 'next/headers';

import type { childrenType } from '@types';
import { ConfiguratorLayoutTemplate } from '@templates';
import { ConfiguratorCatalogShell } from '@providers/configuratorCatalogProvider/ConfiguratorCatalogShell';
import { resolveConfiguratorProduct } from '@shopify';

export const dynamic = 'force-dynamic';

type configuratorLayoutPropsType = childrenType & {
  params: Promise<{ collectionHandle: string; slug: string }>;
};

const ConfiguratorLayout = async ({ children, params }: configuratorLayoutPropsType) => {
  const { collectionHandle, slug } = await params;
  const product = await resolveConfiguratorProduct(slug, collectionHandle);

  // The browser sends Sec-Fetch-Dest: iframe for a cross-origin embed. Deciding here,
  // on the server, keeps the standalone header out of the SSR HTML when embedded, so
  // there is no first-paint flash of it before hydration removes it in the iframe.
  // Netlify strips Sec-Fetch-* before the SSR handler, so middleware.ts mirrors the
  // signal onto x-embedded (and also covers the ?embedded=1 on the iframe src).
  const requestHeaders = await headers();
  const embedded = requestHeaders.get('sec-fetch-dest') === 'iframe' || requestHeaders.get('x-embedded') === '1';

  return (
    <ConfiguratorCatalogShell>
      <ConfiguratorLayoutTemplate collectionHandle={collectionHandle} slug={slug} product={product} embedded={embedded}>
        {children}
      </ConfiguratorLayoutTemplate>
    </ConfiguratorCatalogShell>
  );
};

export default ConfiguratorLayout;
