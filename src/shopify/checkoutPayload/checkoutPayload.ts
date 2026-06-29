/** Wire format between the client (Prosegui) and the `/api/checkout` server route. */

type checkoutLineAttributeType = {
  key: string;
  value: string;
};

type checkoutLinePayloadType = {
  /** Shopify product handle; the server resolves it to a default variant GID. */
  handle: string;
  quantity: number;
  attributes: checkoutLineAttributeType[];
};

type createCheckoutPayloadType = {
  lines: checkoutLinePayloadType[];
};

type createCheckoutResultType = {
  checkoutUrl: string;
};

export type { checkoutLineAttributeType, checkoutLinePayloadType, createCheckoutPayloadType, createCheckoutResultType };
