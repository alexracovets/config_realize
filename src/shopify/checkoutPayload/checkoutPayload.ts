type checkoutLineAttributeType = {
  key: string;
  value: string;
};

type checkoutLinePayloadType = {

  handle: string;
  quantity: number;
  attributes: checkoutLineAttributeType[];
};

type createCheckoutPayloadType = {
  lines: checkoutLinePayloadType[];

  attributes?: checkoutLineAttributeType[];
};

type createCheckoutResultType = {
  checkoutUrl: string;
};

export type { checkoutLineAttributeType, checkoutLinePayloadType, createCheckoutPayloadType, createCheckoutResultType };
