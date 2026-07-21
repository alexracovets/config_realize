import { createStagedUploadTargets } from '@shopify/createStagedUploadTargets';
import { registerShopifyFiles } from '@shopify/registerShopifyFiles';
import { uploadBlobToStagedTarget } from '@utils/uploadBlobToStagedTarget';

const uploadShopifyFile = async (file: Blob, filename: string, mimeType: string): Promise<string> => {
  const contentType = mimeType.startsWith('image/') ? 'IMAGE' : 'FILE';
  const [target] = await createStagedUploadTargets([{ filename, mimeType, fileSize: file.size }]);

  await uploadBlobToStagedTarget(target, file);

  const [url] = await registerShopifyFiles([{ resourceUrl: target.resourceUrl, contentType }]);
  return url;
};

export { uploadShopifyFile };
