import { sendOrderEmails } from '@mail';
import { getShopifyAdminClientSecret, setOrderMetafields, verifyShopifyWebhookSignature } from '@shopify';
import type { orderMetafieldInputType } from '@shopify';
import { formatCheckoutOrderDate } from '@utils/buildCheckoutOrderExport';
import { resolvePublicAppOrigin } from '@utils/resolvePublicAppOrigin';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

import { generateOrderPdfs } from './generateOrderPdfs';
import type { orderPdfContextType } from './generateOrderPdfs';

export const dynamic = 'force-dynamic';

const ORDER_WEBHOOK_MAX_CONCURRENCY = 3;
const ORDER_WEBHOOK_MAX_QUEUE_SIZE = 200;
const ORDER_WEBHOOK_COMPLETED_TTL_MS = 6 * 60 * 60 * 1000;
const ORDER_WEBHOOK_QUEUE_NAME = 'shopify-orders-create';
const ORDER_WEBHOOK_JOB_TTL_SECONDS = 6 * 60 * 60;

type orderWebhookJobDataType = {
  order: shopifyOrderPayloadType;
  configUrl: string;
  uvImageUrls?: string;
  appOrigin: string | null;
};

type orderWebhookRedisQueueStateType = {
  queue: Queue<orderWebhookJobDataType> | null;
  worker: Worker<orderWebhookJobDataType> | null;
  connection: IORedis | null;
};

const redisQueueStateKey = '__orderCreateWebhookRedisQueueState__';
const globalRedisQueueState = globalThis as typeof globalThis & {
  [redisQueueStateKey]?: orderWebhookRedisQueueStateType;
};

const orderWebhookRedisQueueState: orderWebhookRedisQueueStateType = globalRedisQueueState[redisQueueStateKey] ?? {
  queue: null,
  worker: null,
  connection: null,
};
globalRedisQueueState[redisQueueStateKey] = orderWebhookRedisQueueState;

type orderWebhookQueueItemType = {
  key: string;
  run: () => Promise<void>;
};

type orderWebhookQueueStateType = {
  pending: orderWebhookQueueItemType[];
  activeCount: number;
  inFlight: Set<string>;
  completedAtByKey: Map<string, number>;
};

const queueStateKey = '__orderCreateWebhookQueueState__';
const globalQueueState = globalThis as typeof globalThis & {
  [queueStateKey]?: orderWebhookQueueStateType;
};

const orderWebhookQueueState: orderWebhookQueueStateType = globalQueueState[queueStateKey] ?? {
  pending: [],
  activeCount: 0,
  inFlight: new Set<string>(),
  completedAtByKey: new Map<string, number>(),
};
globalQueueState[queueStateKey] = orderWebhookQueueState;

type shopifyOrderNoteAttributeType = {
  name: string;
  value: string;
};

type shopifyAddressType = {
  name?: string | null;
  company?: string | null;
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

const clearExpiredCompletedWebhookKeys = (): void => {
  const now = Date.now();
  orderWebhookQueueState.completedAtByKey.forEach((completedAt, key) => {
    if (now - completedAt > ORDER_WEBHOOK_COMPLETED_TTL_MS) {
      orderWebhookQueueState.completedAtByKey.delete(key);
    }
  });
};

const isWebhookAlreadyCompleted = (key: string): boolean => {
  clearExpiredCompletedWebhookKeys();
  return orderWebhookQueueState.completedAtByKey.has(key);
};

const isWebhookInFlight = (key: string): boolean => orderWebhookQueueState.inFlight.has(key);

const markWebhookCompleted = (key: string): void => {
  orderWebhookQueueState.inFlight.delete(key);
  orderWebhookQueueState.completedAtByKey.set(key, Date.now());
};

const markWebhookFailed = (key: string): void => {
  orderWebhookQueueState.inFlight.delete(key);
};

const getRedisUrl = (): string | null => {
  const url = process.env.REDIS_URL?.trim();
  return url ? url : null;
};

const hasRedisQueueEnabled = (): boolean => Boolean(getRedisUrl());

const ensureRedisQueue = (): Queue<orderWebhookJobDataType> | null => {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  if (orderWebhookRedisQueueState.queue) return orderWebhookRedisQueueState.queue;

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  const queue = new Queue<orderWebhookJobDataType>(ORDER_WEBHOOK_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1500,
      },
      removeOnComplete: {
        age: ORDER_WEBHOOK_JOB_TTL_SECONDS,
        count: 2000,
      },
      removeOnFail: {
        age: ORDER_WEBHOOK_JOB_TTL_SECONDS,
        count: 1000,
      },
    },
  });

  orderWebhookRedisQueueState.connection = connection;
  orderWebhookRedisQueueState.queue = queue;
  return queue;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const runWebhookJobWithRetry = async (job: () => Promise<void>, maxAttempts = 3): Promise<void> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await job();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(750 * attempt);
      }
    }
  }
  throw lastError;
};

const drainOrderWebhookQueue = (): void => {
  while (orderWebhookQueueState.activeCount < ORDER_WEBHOOK_MAX_CONCURRENCY && orderWebhookQueueState.pending.length > 0) {
    const item = orderWebhookQueueState.pending.shift();
    if (!item) break;

    orderWebhookQueueState.activeCount += 1;
    void runWebhookJobWithRetry(item.run)
      .then(() => markWebhookCompleted(item.key))
      .catch((error) => {
        markWebhookFailed(item.key);
        console.error(`[shopify webhook] Background processing failed for order ${item.key}:`, error);
      })
      .finally(() => {
        orderWebhookQueueState.activeCount -= 1;
        drainOrderWebhookQueue();
      });
  }
};

const enqueueOrderWebhook = (item: orderWebhookQueueItemType): boolean => {
  if (orderWebhookQueueState.pending.length >= ORDER_WEBHOOK_MAX_QUEUE_SIZE) {
    return false;
  }

  orderWebhookQueueState.pending.push(item);
  orderWebhookQueueState.inFlight.add(item.key);
  drainOrderWebhookQueue();
  return true;
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
  const address = order.shipping_address ?? order.billing_address;
  const street = [address?.address1, address?.address2].filter(Boolean).join(', ');
  return {
    company: address?.company ?? '',
    street,
    postalCode: address?.zip ?? '',
    city: address?.city ?? '',
    province: address?.province ?? '',
    country: address?.country ?? '',
  };
};

const buildShippingSummary = (address: orderPdfContextType['shippingAddress']): string =>
  [address.company, address.street, [address.postalCode, address.city].filter(Boolean).join(' '), address.province, address.country].filter(Boolean).join(', ');

const processOrderWebhook = async (
  order: shopifyOrderPayloadType,
  configUrl: string,
  uvImageUrls: string | undefined,
  appOrigin: string | null,
): Promise<void> => {
  const fields: orderMetafieldInputType[] = [];
  fields.push({ key: 'config_url', type: 'url', value: configUrl });
  if (uvImageUrls) fields.push({ key: 'uv_image_urls', type: 'json', value: uvImageUrls });

  const orderNumber = order.name ?? `#${order.id}`;
  const orderDate = formatCheckoutOrderDate(order.created_at ? new Date(order.created_at) : new Date());
  const recipient = buildRecipient(order);
  const shippingAddress = buildShippingAddress(order);

  const { orderPdfUrl, cuttingPdfUrl, orderPdfBuffer, cuttingPdfBuffer } = await generateOrderPdfs({
    configUrl,
    appOrigin,
    orderNumber,
    orderDate,
    recipient,
    shippingAddress,
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
  await setOrderMetafields(`gid://shopify/Order/${order.id}`, fields);

  try {
    const emailResult = await sendOrderEmails({
      orderNumber,
      orderDate,
      customer: recipient,
      shippingSummary: buildShippingSummary(shippingAddress),
      orderPdfUrl,
      cuttingPdfUrl,
      orderPdfBuffer,
      cuttingPdfBuffer,
    });
    console.info(`[shopify webhook] Order ${orderNumber} emails — customer: ${emailResult.customer}, owner: ${emailResult.owner}.`);
  } catch (error) {
    console.error(`[shopify webhook] Failed to send order emails for ${orderNumber}:`, error);
  }
};

const ensureRedisWorker = (): Worker<orderWebhookJobDataType> | null => {
  const queue = ensureRedisQueue();
  const connection = orderWebhookRedisQueueState.connection;
  if (!queue || !connection) return null;

  if (orderWebhookRedisQueueState.worker) return orderWebhookRedisQueueState.worker;

  const worker = new Worker<orderWebhookJobDataType>(
    ORDER_WEBHOOK_QUEUE_NAME,
    async (job) => {
      const { order, configUrl, uvImageUrls, appOrigin } = job.data;
      await processOrderWebhook(order, configUrl, uvImageUrls, appOrigin);
    },
    {
      connection,
      concurrency: ORDER_WEBHOOK_MAX_CONCURRENCY,
    },
  );

  worker.on('failed', (job, error) => {
    const orderId = job?.data.order.id ?? 'unknown';
    console.error(`[shopify webhook] Redis worker failed for order ${orderId}:`, error);
  });

  worker.on('error', (error) => {
    console.error('[shopify webhook] Redis worker error:', error);
  });

  orderWebhookRedisQueueState.worker = worker;
  return worker;
};

const enqueueOrderWebhookRedis = async (payload: orderWebhookJobDataType): Promise<'queued' | 'deduplicated' | 'queue-full'> => {
  const queue = ensureRedisQueue();
  if (!queue) {
    throw new Error('Redis queue is not configured.');
  }

  const counts = await queue.getJobCounts('waiting', 'delayed');
  const pendingCount = (counts.waiting ?? 0) + (counts.delayed ?? 0);
  if (pendingCount >= ORDER_WEBHOOK_MAX_QUEUE_SIZE) {
    return 'queue-full';
  }

  const orderKey = String(payload.order.id);
  const existingJob = await queue.getJob(orderKey);
  if (existingJob) {
    return 'deduplicated';
  }

  await queue.add('orders-create', payload, { jobId: orderKey });
  return 'queued';
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
    console.warn(
      `[shopify webhook] Order ${order.name ?? order.id} has no "${NOTE_ATTRIBUTE_KEYS.configUrl}" note attribute — skipping PDF generation. Present attributes: ${
        attributes.map((attribute) => attribute.name).join(', ') || '(none)'
      }`,
    );
    return Response.json({ skipped: true, reason: 'missing-config-url' });
  }

  const orderKey = String(order.id);
  const appOrigin = resolvePublicAppOrigin(request);

  if (!appOrigin) {
    console.warn(
      `[shopify webhook] Public app origin is missing (request origin was ${new URL(request.url).origin}). PDF image links will use source file URLs. Set APP_ORIGIN.`,
    );
  }

  if (hasRedisQueueEnabled()) {
    try {
      ensureRedisWorker();
      const redisResult = await enqueueOrderWebhookRedis({
        order,
        configUrl,
        uvImageUrls,
        appOrigin,
      });

      if (redisResult === 'deduplicated') {
        return Response.json({ ok: true, deduplicated: true, queue: 'redis' });
      }

      if (redisResult === 'queue-full') {
        return Response.json({ error: 'Webhook queue is busy. Retry later.' }, { status: 503 });
      }

      return Response.json({ accepted: true, queued: true, queue: 'redis' });
    } catch (error) {
      console.error(`[shopify webhook] Redis queue fallback to memory for order ${order.id}:`, error);
    }
  }

  if (isWebhookAlreadyCompleted(orderKey) || isWebhookInFlight(orderKey)) {
    return Response.json({ ok: true, deduplicated: true, queue: 'memory' });
  }

  const enqueued = enqueueOrderWebhook({
    key: orderKey,
    run: async () => {
      try {
        await processOrderWebhook(order, configUrl, uvImageUrls, appOrigin);
      } catch (error) {
        console.error(`[shopify webhook] Failed to process order ${order.id} in background:`, error);
        throw error;
      }
    },
  });

  if (!enqueued) {
    console.error(`[shopify webhook] Queue is full. Unable to enqueue order ${order.id}.`);
    return Response.json({ error: 'Webhook queue is busy. Retry later.' }, { status: 503 });
  }

  return Response.json({
    accepted: true,
    queued: true,
    queue: 'memory',
    queueSize: orderWebhookQueueState.pending.length,
    activeWorkers: orderWebhookQueueState.activeCount,
  });
}
