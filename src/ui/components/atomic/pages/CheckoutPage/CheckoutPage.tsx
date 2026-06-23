'use client';

import { Container } from '@atoms';
import { CheckoutView } from '@organisms';
import { useCheckoutInit } from '@hooks';

const CheckoutPage = () => {
  useCheckoutInit();

  return (
    <Container>
      <CheckoutView />
    </Container>
  );
};

export { CheckoutPage };
