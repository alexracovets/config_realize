'use client';

import { Flex } from '@atoms';

import type { checkoutTablePlaceholderPropsType } from '@types';
import { cn } from '@utils';

const CheckoutTablePlaceholder = ({ className }: checkoutTablePlaceholderPropsType) => (
  <Flex className={cn('w-full items-center justify-center', className)}>
    <span className="text-[16px] leading-none text-default">-</span>
  </Flex>
);

export { CheckoutTablePlaceholder };
