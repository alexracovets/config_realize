import type { childrenType } from '@types';
import { ConfiguratorLayoutTemplate } from '@templates';
import { ConfiguratorCatalogShell } from '@providers/configuratorCatalogProvider/ConfiguratorCatalogShell';
import { resolveConfiguratorProduct } from '@shopify';

type configuratorLayoutPropsType = childrenType & {
  params: Promise<{ collectionHandle: string; slug: string }>;
};

const ConfiguratorLayout = async ({ children, params }: configuratorLayoutPropsType) => {
  const { collectionHandle, slug } = await params;
  const product = await resolveConfiguratorProduct(slug, collectionHandle);

  return (
    <ConfiguratorCatalogShell>
      <ConfiguratorLayoutTemplate collectionHandle={collectionHandle} slug={slug} product={product}>
        {children}
      </ConfiguratorLayoutTemplate>
    </ConfiguratorCatalogShell>
  );
};

export default ConfiguratorLayout;
