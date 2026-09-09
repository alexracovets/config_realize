'use client';

import { cn } from '@utils';
import type { containerPropsType } from '@types';

const Container = ({ children, className }: containerPropsType) => {
  return <section className={cn('w-full max-w-360 px-12 mx-auto', 'max-xl:px-6', 'max-sm:px-4', className)}>{children}</section>;
};

export { Container };
