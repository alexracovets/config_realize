import type { createCheckoutPayloadType, createCheckoutResultType } from '@shopify/checkoutPayload';
import { getShopifyApiMode } from '@shopify/config';
import { shopifyGraphql } from '@shopify/graphqlClient';

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type productVariantNodeType = {
  handle: string;
  variants?: { nodes?: { id: string }[] } | null;
};

const buildVariantQuery = (handles: string[]): string => {
  const args = handles.map((_, index) => `$h${index}: String!`).join(', ');
  const body = handles
    .map((_, index) => `p${index}: product(handle: $h${index}) { handle variants(first: 1) { nodes { id } } }`)
    .join('\n    ');

  return `#graphql\n  query CheckoutVariants(${args}) {\n    ${body}\n  }`;
};

/** Resolves each product handle to its default (first) variant GID via the Storefront API. */
const resolveVariantIdsByHandle = async (handles: string[]): Promise<Map<string, string>> => {
  const variables = Object.fromEntries(handles.map((handle, index) => [`h${index}`, handle]));
  const data = await shopifyGraphql<Record<string, productVariantNodeType | null>>(buildVariantQuery(handles), variables);

  const variantByHandle = new Map<string, string>();

  handles.forEach((handle, index) => {
    const variantId = data[`p${index}`]?.variants?.nodes?.[0]?.id;
    if (variantId) {
      variantByHandle.set(handle, variantId);
    }
  });

  return variantByHandle;
};

const createCheckoutCart = async (payload: createCheckoutPayloadType): Promise<createCheckoutResultType> => {
  if (getShopifyApiMode() !== 'storefront') {
    throw new Error('[shopify] createCheckoutCart requires storefront API mode (SHOPIFY_STOREFRONT_ACCESS_TOKEN).');
  }

  if (!payload.lines.length) {
    throw new Error('[shopify] Cannot create a checkout with no lines.');
  }

  const uniqueHandles = [...new Set(payload.lines.map((line) => line.handle))];
  const variantByHandle = await resolveVariantIdsByHandle(uniqueHandles);

  const missingHandle = uniqueHandles.find((handle) => !variantByHandle.has(handle));
  if (missingHandle) {
    throw new Error(`[shopify] No purchasable variant found for product "${missingHandle}". Is it published to the Online Store?`);
  }

  const lines = payload.lines.map((line) => ({
    merchandiseId: variantByHandle.get(line.handle),
    quantity: line.quantity,
    attributes: line.attributes,
  }));

  const data = await shopifyGraphql<{
    cartCreate?: {
      cart?: { id: string; checkoutUrl: string } | null;
      userErrors?: { field?: string[] | null; message: string }[];
    };
  }>(CART_CREATE_MUTATION, { input: { lines } });

  const userErrors = data.cartCreate?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`[shopify] cartCreate failed: ${userErrors.map((error) => error.message).join('; ')}`);
  }

  const checkoutUrl = data.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error('[shopify] cartCreate returned no checkoutUrl.');
  }

  return { checkoutUrl };
};

export { createCheckoutCart };
