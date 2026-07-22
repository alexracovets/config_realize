'use client';

import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi';

import { Button, Flex, Text } from '@atoms';

import { CHECKOUT_MAX_ROW_QUANTITY, CHECKOUT_MIN_ROW_QUANTITY } from '@constants';
import type { checkoutQuantityStepperPropsType } from '@types';

const CheckoutQuantityStepper = ({ quantity, onDecrease, onIncrease }: checkoutQuantityStepperPropsType) => {
  return (
    <Flex className="items-center justify-center mx-auto">
      <Button type="button" variant="ghost" size="icon" onClick={onDecrease} disabled={quantity <= CHECKOUT_MIN_ROW_QUANTITY} aria-label="Diminuisci quantità">
        <FiMinusCircle className="size-6 text-primary-10" />
      </Button>
      <Text className="text-[16px] leading-[19px] min-w-6 text-center">{quantity}</Text>
      <Button type="button" variant="ghost" size="icon" onClick={onIncrease} disabled={quantity >= CHECKOUT_MAX_ROW_QUANTITY} aria-label="Aumenta quantità">
        <FiPlusCircle className="size-6 text-primary-10" />
      </Button>
    </Flex>
  );
};

export { CheckoutQuantityStepper };
