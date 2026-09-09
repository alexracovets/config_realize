'use client';

import { Flex } from '@atoms';

import type { checkoutTablePlaceholderPropsType } from '@types';

const CheckoutTablePlaceholder = ({ className }: checkoutTablePlaceholderPropsType) => (
  <Flex variant="checkout_placeholder_row" className={className}>
    <span className="text-[16px] leading-none text-default">-</span>
  </Flex>
);

export { CheckoutTablePlaceholder };
