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
      {/* Height comes from the .configurator-shell rule, not a utility class: embedded
          in Shopify it has to track the iframe rather than the viewport, since the host
          already subtracts its own header. Never grows the page — a taller document
          would scroll the host and put the footer out of reach. */}
      <div className="configurator-shell flex flex-col overflow-hidden w-full">
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
