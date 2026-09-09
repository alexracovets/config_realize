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
import { Box, Flex } from '@atoms';

type configuratorLayoutTemplatePropsType = childrenType & {
  collectionHandle: string;
  slug: string;
  product: configuratorProductHydrationType | null;
};

const ConfiguratorLayoutTemplate = ({ children, collectionHandle, slug, product }: configuratorLayoutTemplatePropsType) => {
  return (
    <ConfiguratorRouteShell collectionHandle={collectionHandle} slug={slug} product={product}>
      <Box variant="configurator_shell">
        <Header />
        <Box variant="configurator_shell_background">
          <ConfiguratorInitialLoader />
          <CartConfigurationSync />
          <Box variant="configurator_shell_grid">
            <HeaderConfiguration />
            <Flex variant="configurator_layout_template" asChild>
              <main>
                <AsideConfiguration />
                {children}
                <AsideConfigurationUtility />
              </main>
            </Flex>
            <FooterConfiguration />
          </Box>
        </Box>
      </Box>
    </ConfiguratorRouteShell>
  );
};

export { ConfiguratorLayoutTemplate };
