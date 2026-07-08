'use client';

import { usePathname } from 'next/navigation';

import { LangSwitcher, Search, UserBar } from '@molecules';
import { Box, Container, Flex, Grid, Logo } from '@atoms';
import { useAppNavigate } from '@hooks';
import { useEmbedded } from '@providers';
import { useConfigurationCart } from '@store';
import { buildConfiguratorPath, isConfiguratorPath } from '@utils';

const Header = () => {
  const { embedded } = useEmbedded();
  const { toAppPath } = useAppNavigate();
  const pathname = usePathname();
  const activeItem = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId) ?? state.items[0]);

  if (embedded) {
    return null;
  }

  const isOnConfigurator = isConfiguratorPath(pathname);
  const logoHref = toAppPath(isOnConfigurator || !activeItem?.collectionHandle ? '/' : buildConfiguratorPath(activeItem.collectionHandle, activeItem.slug));

  return (
    <Box variant="header" asChild>
      <header>
        <Container>
          <Grid variant="header">
            <Flex variant="utility_bar">
              <Search />
              <LangSwitcher />
            </Flex>
            <Logo href={logoHref} />
            <UserBar />
          </Grid>
        </Container>
      </header>
    </Box>
  );
};

export { Header };
