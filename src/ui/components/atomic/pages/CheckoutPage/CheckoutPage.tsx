'use client';

import { Container } from '@atoms';
import { CheckoutView } from '@organisms';
import { useCheckoutInit } from '@hooks';
import { CheckoutPreviewCaptureHost } from '@configurator';

const CheckoutPage = () => {
  useCheckoutInit();

  return (
    <Container>
      <CheckoutPreviewCaptureHost />
      <CheckoutView />
    </Container>
  );
};

export { CheckoutPage };
