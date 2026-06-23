'use client';

import { Footer } from '@organisms';
import type { defaultPagesTemplatePropsType } from '@types';

const DefaultPagesTemplate = ({ children, noFooter = false }: defaultPagesTemplatePropsType) => {
  return (
    <>
      <div className="flex-1">{children}</div>
      {!noFooter && <Footer />}
    </>
  );
};

export { DefaultPagesTemplate };
