'use client';

import type { checkoutE2eFixtureType } from '@store/useCheckout/checkoutE2eTypes';
import { seedCheckoutE2eFixture } from '@store/useCheckout/seedCheckoutE2eFixture';

const revealOrderExportDocument = () => {
  const host = document.querySelector('[data-testid="checkout-order-export-host"]');
  if (!(host instanceof HTMLElement)) return;
  host.className = 'fixed top-0 left-0 z-[9999] w-[794px] bg-white';
  host.removeAttribute('aria-hidden');
};

const getOrderExportText = () => {
  const documentRoot = document.querySelector('[data-testid="checkout-order-export-document"]');
  return documentRoot?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
};

const registerCheckoutE2eDebug = () => {
  if (process.env.NODE_ENV === 'production') {
    return () => undefined;
  }

  window.__checkoutE2e = {
    seedOrderExportFixture: (fixture: checkoutE2eFixtureType) => seedCheckoutE2eFixture(fixture),
    revealOrderExportDocument,
    getOrderExportText,
  };

  return () => {
    delete window.__checkoutE2e;
  };
};

export { registerCheckoutE2eDebug };
