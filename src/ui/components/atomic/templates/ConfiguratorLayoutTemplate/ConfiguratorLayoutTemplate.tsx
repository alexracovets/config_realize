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
import { Flex } from '@atoms';

type configuratorLayoutTemplatePropsType = childrenType & {
  collectionHandle: string;
  slug: string;
  product: configuratorProductHydrationType | null;
};

const ConfiguratorLayoutTemplate = ({ children, collectionHandle, slug, product }: configuratorLayoutTemplatePropsType) => {
  return (
    <ConfiguratorRouteShell collectionHandle={collectionHandle} slug={slug} product={product}>
      {/* Embedded in Shopify the iframe height is set by the host, not the device
          viewport, so pinning to dvh clips the footer out of reach. There the shell
          grows with its content and the host resizes the frame to match. */}
      <div className="configurator-shell flex h-dvh max-h-dvh flex-col overflow-hidden w-full">
        <Header />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-t from-[#E8E8E8] to-white">
          <ConfiguratorInitialLoader />
          <CartConfigurationSync />
          <div className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
            <HeaderConfiguration />
            <Flex variant="configurator_layout_template" asChild>
              <main>
                <AsideConfiguration />
                {children}
                <AsideConfigurationUtility />
              </main>
            </Flex>
            <FooterConfiguration />
          </div>
        </div>
      </div>
    </ConfiguratorRouteShell>
  );
};

export { ConfiguratorLayoutTemplate };
