import { getShopifyAdminClientSecret, ORDER_METAFIELD_NAMESPACE, setOrderMetafields, verifyShopifyWebhookSignature } from '@shopify';
import type { orderMetafieldInputType } from '@shopify';
import { formatCheckoutOrderDate } from '@utils/buildCheckoutOrderExport';

import { generateOrderPdfs } from './generateOrderPdfs';
import type { orderPdfContextType } from './generateOrderPdfs';

export const dynamic = 'force-dynamic';

type shopifyOrderNoteAttributeType = {
  name: string;
  value: string;
};

type shopifyAddressType = {
  name?: string | null;
  address1?: string | null;
  address2?: string | null;
  zip?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
};

type shopifyOrderPayloadType = {
  id: number | string;
  name?: string;
  created_at?: string;
  contact_email?: string | null;
  email?: string | null;
  phone?: string | null;
  subtotal_price?: string | null;
  total_discounts?: string | null;
  total_shipping_price_set?: { shop_money?: { amount?: string | null } | null } | null;
  total_price?: string | null;
  customer?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  shipping_address?: shopifyAddressType | null;
  billing_address?: shopifyAddressType | null;
  note_attributes?: shopifyOrderNoteAttributeType[];
};

const NOTE_ATTRIBUTE_KEYS = {
  uvImageUrls: '_uv_image_urls',
  configUrl: '_config_url',
} as const;

const readNoteAttribute = (attributes: shopifyOrderNoteAttributeType[], name: string): string | undefined =>
  attributes.find((attribute) => attribute.name === name)?.value;

const toNumber = (value: string | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildRecipient = (order: shopifyOrderPayloadType): orderPdfContextType['recipient'] => {
  const shipping = order.shipping_address;
  const name = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ') || shipping?.name?.trim() || '';
  return {
    name,
    email: order.contact_email ?? order.customer?.email ?? order.email ?? '',
    phone: order.phone ?? shipping?.phone ?? '',
  };
};

const buildShippingAddress = (order: shopifyOrderPayloadType): orderPdfContextType['shippingAddress'] => {
  const shipping = order.shipping_address;
  const street = [shipping?.address1, shipping?.address2].filter(Boolean).join(', ');
  return {
    street,
    postalCode: shipping?.zip ?? '',
    city: [shipping?.city, shipping?.province].filter(Boolean).join(' '),
    country: shipping?.country ?? '',
  };
};

export async function POST(request: Request): Promise<Response> {
  const secret = getShopifyAdminClientSecret();
  if (!secret) {
    console.error('[shopify webhook] SHOPIFY_ADMIN_CLIENT_SECRET is not configured.');
    return Response.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  const rawBody = await request.text();
  const receivedHmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyShopifyWebhookSignature(rawBody, receivedHmac, secret)) {
    return Response.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let order: shopifyOrderPayloadType;

  try {
    order = JSON.parse(rawBody) as shopifyOrderPayloadType;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const attributes = order.note_attributes ?? [];
  const configUrl = readNoteAttribute(attributes, NOTE_ATTRIBUTE_KEYS.configUrl);
  const uvImageUrls = readNoteAttribute(attributes, NOTE_ATTRIBUTE_KEYS.uvImageUrls);

  if (!configUrl) {
    return Response.json({ skipped: true });
  }

  const fields: orderMetafieldInputType[] = [];
  fields.push({ key: 'config_url', type: 'url', value: configUrl });
  if (uvImageUrls) fields.push({ key: 'uv_image_urls', type: 'json', value: uvImageUrls });

  try {
    const { orderPdfUrl, cuttingPdfUrl } = await generateOrderPdfs({
      configUrl,
      appOrigin: new URL(request.url).origin,
      orderNumber: order.name ?? `#${order.id}`,
      orderDate: formatCheckoutOrderDate(order.created_at ? new Date(order.created_at) : new Date()),
      recipient: buildRecipient(order),
      shippingAddress: buildShippingAddress(order),
      billingNote: "Corrisponde all'indirizzo di spedizione",
      money: {
        subtotal: toNumber(order.subtotal_price),
        discountAmount: toNumber(order.total_discounts),
        shippingCost: toNumber(order.total_shipping_price_set?.shop_money?.amount),
        grandTotal: toNumber(order.total_price),
      },
    });

    fields.push({ key: 'order_pdf_url', type: 'url', value: orderPdfUrl });
    fields.push({ key: 'cutting_pdf_url', type: 'url', value: cuttingPdfUrl });
  } catch (error) {
    console.error(`[shopify webhook] Failed to generate order PDFs for order ${order.id}:`, error);
    return Response.json({ error: 'Failed to generate order PDFs.' }, { status: 500 });
  }

  try {
    await setOrderMetafields(`gid://shopify/Order/${order.id}`, fields);
  } catch (error) {
    console.error(`[shopify webhook] Failed to set ${ORDER_METAFIELD_NAMESPACE} metafields for order ${order.id}:`, error);
    return Response.json({ error: 'Failed to persist order metafields.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
