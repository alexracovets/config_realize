import { shopifyAdminGraphql } from '@shopify/adminClient';

const METAFIELDS_SET_MUTATION = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type metafieldsSetResponseType = {
  metafieldsSet?: {
    userErrors?: { field?: string[] | null; message: string }[];
  };
};

const ORDER_METAFIELD_NAMESPACE = 'configurator';

type orderMetafieldInputType = {
  key: string;
  type: 'url' | 'json';
  value: string;
};

/** Sets one or more `configurator.*` metafields on a Shopify order via the Admin API. */
const setOrderMetafields = async (orderId: string, fields: orderMetafieldInputType[]): Promise<void> => {
  if (!fields.length) return;

  const metafields = fields.map((field) => ({
    ownerId: orderId,
    namespace: ORDER_METAFIELD_NAMESPACE,
    key: field.key,
    type: field.type,
    value: field.value,
  }));

  const data = await shopifyAdminGraphql<metafieldsSetResponseType>(METAFIELDS_SET_MUTATION, { metafields });

  const userErrors = data.metafieldsSet?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`[shopify] metafieldsSet failed: ${userErrors.map((error) => error.message).join('; ')}`);
  }
};

export { ORDER_METAFIELD_NAMESPACE, setOrderMetafields };
export type { orderMetafieldInputType };
