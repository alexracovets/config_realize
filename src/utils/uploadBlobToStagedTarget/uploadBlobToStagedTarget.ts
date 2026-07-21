import type { stagedUploadTargetType } from '@shopify/stagedUpload';

const uploadBlobToStagedTarget = async (target: stagedUploadTargetType, file: Blob): Promise<void> => {
  const formData = new FormData();
  target.parameters.forEach(({ name, value }) => formData.append(name, value));
  formData.append('file', file);

  const response = await fetch(target.url, { method: 'POST', body: formData });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`[shopify] Staged upload HTTP ${response.status}: ${response.statusText} ${body}`.trim());
  }
};

export { uploadBlobToStagedTarget };
