'use client';

import { useCallback, useState } from 'react';

import { useCheckout, useConfigurationCart } from '@store';
import { buildOrderPreset, isEmbeddedSession } from '@utils';
import { postEmbeddedCheckoutRedirect } from '@utils/embeddedUrlSync';
import type { createCheckoutResultType } from '@shopify/checkoutPayload';

const CHECKOUT_ENDPOINT = '/api/checkout';

/**
 * Submits the configured session as a Shopify cart and redirects to checkout. The cart is
 * created server-side (`/api/checkout`) to keep Storefront tokens off the client; when
 * embedded the redirect is delegated to the theme (cross-origin top-window navigation).
 */
const useSubmitCheckout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCheckout = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { products } = useCheckout.getState();
      const { configurations } = useConfigurationCart.getState();
      const payload = buildOrderPreset(products, configurations);

      if (!payload.lines.length) {
        throw new Error('Nessun prodotto da ordinare.');
      }

      const response = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as createCheckoutResultType & { error?: string };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? 'Impossibile creare il checkout.');
      }

      if (isEmbeddedSession()) {
        postEmbeddedCheckoutRedirect(data.checkoutUrl);
      } else {
        window.location.assign(data.checkoutUrl);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Errore sconosciuto.');
      setIsSubmitting(false);
    }
  }, []);

  return { submitCheckout, isSubmitting, error };
};

export { useSubmitCheckout };
