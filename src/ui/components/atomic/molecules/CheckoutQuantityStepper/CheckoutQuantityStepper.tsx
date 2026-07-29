'use client';

import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi';

import { Button, Flex, Text } from '@atoms';

import { CHECKOUT_MAX_ROW_QUANTITY, CHECKOUT_MIN_ROW_QUANTITY } from '@constants';
import type { checkoutQuantityStepperPropsType } from '@types';
import { cn } from '@utils';

const CheckoutQuantityStepper = ({
  quantity,
  onDecrease,
  onIncrease,
  decreaseIconClassName,
  increaseIconClassName,
}: checkoutQuantityStepperPropsType) => {
  return (
    <Flex className="mx-auto items-center justify-center">
      <Button type="button" variant="ghost" size="icon" onClick={onDecrease} disabled={quantity <= CHECKOUT_MIN_ROW_QUANTITY} aria-label="Diminuisci quantità">
        <FiMinusCircle className={cn('size-6 text-primary-10 max-sm:size-4.5', decreaseIconClassName)} />
      </Button>
      <Text className="min-w-6 text-center text-[16px] leading-[19px] max-sm:min-w-4 max-sm:text-[14px]">{quantity}</Text>
      <Button type="button" variant="ghost" size="icon" onClick={onIncrease} disabled={quantity >= CHECKOUT_MAX_ROW_QUANTITY} aria-label="Aumenta quantità">
        <FiPlusCircle className={cn('size-6 text-primary-10 max-sm:size-4.5', increaseIconClassName)} />
      </Button>
    </Flex>
  );
};

export { CheckoutQuantityStepper };
