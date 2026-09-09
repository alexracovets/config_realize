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
          <Grid variant="footer_notification">
            <Flex></Flex>
            <Notification />
          </Grid>
        </Container>
      </footer>
    </Box>
  );
};

export { Footer };
