import { getShopifyAdminClientSecret, ORDER_METAFIELD_NAMESPACE, setOrderMetafields, verifyShopifyWebhookSignature } from '@shopify';
import type { orderMetafieldInputType } from '@shopify';

export const dynamic = 'force-dynamic';

type shopifyOrderNoteAttributeType = {
  name: string;
  value: string;
};

type shopifyOrderPayloadType = {
  id: number | string;
  note_attributes?: shopifyOrderNoteAttributeType[];
};

const NOTE_ATTRIBUTE_KEYS = {
  orderPdfUrl: '_order_pdf_url',
  cuttingPdfUrl: '_cutting_pdf_url',
  uvImageUrls: '_uv_image_urls',
} as const;

const readNoteAttribute = (attributes: shopifyOrderNoteAttributeType[], name: string): string | undefined =>
  attributes.find((attribute) => attribute.name === name)?.value;

const buildMetafieldsFromOrder = (order: shopifyOrderPayloadType): orderMetafieldInputType[] => {
  const attributes = order.note_attributes ?? [];
  const fields: orderMetafieldInputType[] = [];

  const orderPdfUrl = readNoteAttribute(attributes, NOTE_ATTRIBUTE_KEYS.orderPdfUrl);
  if (orderPdfUrl) fields.push({ key: 'order_pdf_url', type: 'url', value: orderPdfUrl });

  const cuttingPdfUrl = readNoteAttribute(attributes, NOTE_ATTRIBUTE_KEYS.cuttingPdfUrl);
  if (cuttingPdfUrl) fields.push({ key: 'cutting_pdf_url', type: 'url', value: cuttingPdfUrl });

  const uvImageUrls = readNoteAttribute(attributes, NOTE_ATTRIBUTE_KEYS.uvImageUrls);
  if (uvImageUrls) fields.push({ key: 'uv_image_urls', type: 'json', value: uvImageUrls });

  return fields;
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

  const fields = buildMetafieldsFromOrder(order);

  if (!fields.length) {
    return Response.json({ skipped: true });
  }

  try {
    await setOrderMetafields(`gid://shopify/Order/${order.id}`, fields);
  } catch (error) {
    console.error(`[shopify webhook] Failed to set ${ORDER_METAFIELD_NAMESPACE} metafields for order ${order.id}:`, error);
  }

  return Response.json({ ok: true });
}
