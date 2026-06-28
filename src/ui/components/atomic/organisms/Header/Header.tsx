'use client';

import { usePathname } from 'next/navigation';

import { LangSwitcher, Search, UserBar } from '@molecules';
import { Box, Container, Flex, Grid, Logo } from '@atoms';
import { useAppNavigate } from '@hooks';
import { useEmbedded } from '@providers';
import { useConfigurationCart } from '@store';

const Header = () => {
  const { embedded } = useEmbedded();
  const { toAppPath } = useAppNavigate();
  const pathname = usePathname();
  const activeSlug = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId)?.slug ?? state.items[0]?.slug);

  if (embedded) {
    return null;
  }

  const isOnConfigurator = pathname !== '/' && pathname !== '/checkout';
  const logoHref = toAppPath(isOnConfigurator || !activeSlug ? '/' : `/${activeSlug}`);

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
