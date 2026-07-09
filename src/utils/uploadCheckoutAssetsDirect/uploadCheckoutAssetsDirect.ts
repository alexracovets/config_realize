import type { shopifyFileContentType, stagedUploadTargetType } from '@shopify/stagedUpload';
import { uploadBlobToStagedTarget } from '@utils/uploadBlobToStagedTarget';

const STAGED_TARGETS_ENDPOINT = '/api/checkout/assets/staged-targets';
const REGISTER_ENDPOINT = '/api/checkout/assets/register';
const STAGED_TARGET_BATCH_SIZE = 50;
const DIRECT_UPLOAD_CONCURRENCY = 5;

type checkoutAssetUploadItemType = {
  id: string;
  blob: Blob;
  filename: string;
  mimeType: string;
};

type stagedTargetRequestFileType = {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
};

type stagedTargetResponseType = {
  targets: Array<{ id: string; target: stagedUploadTargetType }>;
  error?: string;
};

type registerRequestFileType = {
  id: string;
  resourceUrl: string;
  contentType: shopifyFileContentType;
};

type registerResponseType = {
  files: Array<{ id: string; url: string }>;
  error?: string;
};

const resolveShopifyFileContentType = (mimeType: string): shopifyFileContentType => (mimeType.startsWith('image/') ? 'IMAGE' : 'FILE');

const mapWithConcurrency = async <TItem, TResult>(
  items: TItem[],
  concurrency: number,
  mapper: (item: TItem, index: number) => Promise<TResult>,
): Promise<TResult[]> => {
  const results: TResult[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
};

const requestStagedTargets = async (files: stagedTargetRequestFileType[]): Promise<stagedTargetResponseType> => {
  const response = await fetch(STAGED_TARGETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });

  const payload = (await response.json()) as stagedTargetResponseType;
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to create staged upload targets.');
  }

  return payload;
};

const registerUploadedFiles = async (files: registerRequestFileType[]): Promise<registerResponseType> => {
  const response = await fetch(REGISTER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });

  const payload = (await response.json()) as registerResponseType;
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to register Shopify files.');
  }

  return payload;
};

const uploadCheckoutAssetsDirect = async (items: checkoutAssetUploadItemType[]): Promise<Map<string, string>> => {
  const urlById = new Map<string, string>();
  if (!items.length) return urlById;

  for (let offset = 0; offset < items.length; offset += STAGED_TARGET_BATCH_SIZE) {
    const batch = items.slice(offset, offset + STAGED_TARGET_BATCH_SIZE);
    const staged = await requestStagedTargets(
      batch.map((item) => ({
        id: item.id,
        filename: item.filename,
        mimeType: item.mimeType,
        fileSize: item.blob.size,
      })),
    );

    const targetById = new Map(staged.targets.map((entry) => [entry.id, entry.target]));

    await mapWithConcurrency(batch, DIRECT_UPLOAD_CONCURRENCY, async (item) => {
      const target = targetById.get(item.id);
      if (!target) throw new Error(`Missing staged target for asset "${item.id}".`);
      await uploadBlobToStagedTarget(target, item.blob);
    });

    const registered = await registerUploadedFiles(
      batch.map((item) => {
        const target = targetById.get(item.id);
        if (!target) throw new Error(`Missing staged target for asset "${item.id}".`);
        return {
          id: item.id,
          resourceUrl: target.resourceUrl,
          contentType: resolveShopifyFileContentType(item.mimeType),
        };
      }),
    );

    registered.files.forEach((file) => urlById.set(file.id, file.url));
  }

  return urlById;
};

export { uploadCheckoutAssetsDirect };
export type { checkoutAssetUploadItemType };
