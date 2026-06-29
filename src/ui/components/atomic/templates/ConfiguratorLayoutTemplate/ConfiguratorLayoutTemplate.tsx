import type { childrenType } from '@types';
import type { configuratorProductHydrationType } from '@configurator/types';
import {
  AsideConfiguration,
  AsideConfigurationUtility,
  CartConfigurationSync,
  ConfiguratorInitialLoader,
  ConfiguratorRouteShell,
  FooterConfiguration,
  Header,
  HeaderConfiguration,
} from '@organisms';

type configuratorLayoutTemplatePropsType = childrenType & {
  slug: string;
  product: configuratorProductHydrationType | null;
};

const ConfiguratorLayoutTemplate = ({ children, slug, product }: configuratorLayoutTemplatePropsType) => {
  return (
    <ConfiguratorRouteShell slug={slug} product={product}>
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-t from-[#E8E8E8] to-white">
          <ConfiguratorInitialLoader />
          <CartConfigurationSync />
          <div className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
            <HeaderConfiguration />
            <main className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden">
              <AsideConfiguration />
              <div className="min-h-0 min-w-0">{children}</div>
              <AsideConfigurationUtility />
            </main>
            <FooterConfiguration />
          </div>
        </div>
      </div>
    </ConfiguratorRouteShell>
  );
};

export { ConfiguratorLayoutTemplate };
