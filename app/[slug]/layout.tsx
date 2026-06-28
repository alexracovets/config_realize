import type { childrenType } from '@types';
import { ConfiguratorLayoutTemplate } from '@templates';
import { resolveConfiguratorProduct } from '@shopify';

type configuratorLayoutPropsType = childrenType & {
  params: Promise<{ slug: string }>;
};

const ConfiguratorLayout = async ({ children, params }: configuratorLayoutPropsType) => {
  const { slug } = await params;
  const product = await resolveConfiguratorProduct(slug);

  return (
    <ConfiguratorLayoutTemplate slug={slug} product={product}>
      {children}
    </ConfiguratorLayoutTemplate>
  );
};

export default ConfiguratorLayout;
