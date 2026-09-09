'use client';

import { Container } from '@atoms';
import { CheckoutView } from '@organisms';
import { useCheckoutInit } from '@hooks';
import { CheckoutPreviewCaptureHost } from '@configurator';

const CheckoutPage = () => {
  useCheckoutInit();

  return (
    <Container className="flex min-h-0 flex-1 flex-col max-sm:pb-32 pt-[var(--embed-header-offset)]">
      <CheckoutPreviewCaptureHost />
      <CheckoutView />
    </Container>
  );
};

export { CheckoutPage };
