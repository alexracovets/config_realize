import { createHmac, timingSafeEqual } from 'node:crypto';

/** Verifies the `X-Shopify-Hmac-Sha256` header against the raw request body. */
const verifyShopifyWebhookSignature = (rawBody: string, receivedHmac: string | null, secret: string): boolean => {
  if (!receivedHmac) return false;

  const computedHmac = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

  const received = Buffer.from(receivedHmac, 'base64');
  const computed = Buffer.from(computedHmac, 'base64');

  if (received.length !== computed.length) return false;

  return timingSafeEqual(received, computed);
};

export { verifyShopifyWebhookSignature };
