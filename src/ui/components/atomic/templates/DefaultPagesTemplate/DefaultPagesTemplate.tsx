'use client';

import { Footer } from '@organisms';
import { Box } from '@atoms';
import type { defaultPagesTemplatePropsType } from '@types';

const DefaultPagesTemplate = ({ children, noFooter = false }: defaultPagesTemplatePropsType) => {
  return (
    <>
      <Box variant="flex_1">{children}</Box>
      {!noFooter && <Footer />}
    </>
  );
};

export { DefaultPagesTemplate };
