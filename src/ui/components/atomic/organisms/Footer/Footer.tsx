'use client';

import { Notification } from '@molecules';
import { Box, Container, Flex, Grid } from '@atoms';
import { useEmbedded } from '@providers';

const Footer = () => {
  const { embedded } = useEmbedded();

  if (embedded) {
    return null;
  }

  return (
    <Box variant="footer" asChild>
      <footer>
        <Container>
          <Grid className="grid-cols-[1fr_auto] items-center">
            <Flex></Flex>
            <Notification />
          </Grid>
        </Container>
      </footer>
    </Box>
  );
};

export { Footer };
