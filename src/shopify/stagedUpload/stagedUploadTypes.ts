type stagedUploadTargetType = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

type stagedUploadFileInputType = {
  filename: string;
  mimeType: string;
  fileSize: number;
};

type shopifyFileContentType = 'FILE' | 'IMAGE';

type registerShopifyFileInputType = {
  resourceUrl: string;
  contentType: shopifyFileContentType;
};

export type { registerShopifyFileInputType, shopifyFileContentType, stagedUploadFileInputType, stagedUploadTargetType };
