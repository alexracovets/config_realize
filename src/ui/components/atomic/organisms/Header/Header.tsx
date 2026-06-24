'use client';

import { LangSwitcher, Search, UserBar } from '@molecules';
import { Box, Container, Flex, Grid, Logo } from '@atoms';
import { useEmbedded } from '@providers';

const Header = () => {
  const { embedded } = useEmbedded();

  if (embedded) {
    return null;
  }

  return (
    <Box variant="header" asChild>
      <header>
        <Container>
          <Grid variant="header">
            <Flex variant="utility_bar">
              <Search />
              <LangSwitcher />
            </Flex>
            <Logo />
            <UserBar />
          </Grid>
        </Container>
      </header>
    </Box>
  );
};

export { Header };
