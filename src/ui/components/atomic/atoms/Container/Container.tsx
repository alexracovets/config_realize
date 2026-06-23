'use client';

import { cn } from '@utils';
import type { containerPropsType } from '@types';

const Container = ({ children, className }: containerPropsType) => {
  return <div className={cn('w-full max-w-[1440px] px-12 mx-auto', className)}>{children}</div>;
};

export { Container };
