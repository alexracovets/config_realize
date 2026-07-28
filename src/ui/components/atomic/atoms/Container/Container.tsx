'use client';

import { cn } from '@utils';
import type { containerPropsType } from '@types';

const Container = ({ children, className }: containerPropsType) => {
  return <div className={cn('w-full max-w-360 px-12 mx-auto', 'max-sm:px-4', className)}>{children}</div>;
};

export { Container };
