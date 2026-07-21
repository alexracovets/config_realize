import { shopifyAdminGraphql } from '@shopify/adminClient';
import type { registerShopifyFileInputType } from '@shopify/stagedUpload';

const FILE_CREATE_MUTATION = `#graphql
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        ... on GenericFile {
          url
        }
        ... on MediaImage {
          image {
            url
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_STATUS_QUERY = `#graphql
  query FileStatus($id: ID!) {
    node(id: $id) {
      ... on GenericFile {
        url
        fileStatus
      }
      ... on MediaImage {
        fileStatus
        image {
          url
        }
      }
    }
  }
`;

type fileNodeType = {
  id: string;
  fileStatus: string;
  url?: string | null;
  image?: { url?: string | null } | null;
};

type fileCreateResponseType = {
  fileCreate?: {
    files?: fileNodeType[];
    userErrors?: { field?: string[] | null; message: string }[];
  };
};

type fileStatusResponseType = {
  node?: fileNodeType | null;
};

const FILE_STATUS_POLL_ATTEMPTS = 3;
const FILE_STATUS_POLL_DELAY_MS = 1_500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveFileUrl = (file: fileNodeType): string | null => file.url ?? file.image?.url ?? null;

const pollFileUrl = async (fileId: string): Promise<string | null> => {
  for (let attempt = 0; attempt < FILE_STATUS_POLL_ATTEMPTS; attempt += 1) {
    await sleep(FILE_STATUS_POLL_DELAY_MS);
    const data = await shopifyAdminGraphql<fileStatusResponseType>(FILE_STATUS_QUERY, { id: fileId });
    const url = data.node ? resolveFileUrl(data.node) : null;
    if (url) return url;
  }

  return null;
};

const resolveRegisteredFileUrl = async (file: fileNodeType): Promise<string> => {
  const immediateUrl = resolveFileUrl(file);
  if (immediateUrl) return immediateUrl;

  const polledUrl = await pollFileUrl(file.id);
  if (polledUrl) return polledUrl;

  throw new Error(`[shopify] File "${file.id}" did not finish processing in time.`);
};

const registerShopifyFiles = async (files: registerShopifyFileInputType[]): Promise<string[]> => {
  if (!files.length) return [];

  const data = await shopifyAdminGraphql<fileCreateResponseType>(FILE_CREATE_MUTATION, {
    files: files.map((file) => ({ originalSource: file.resourceUrl, contentType: file.contentType })),
  });

  const userErrors = data.fileCreate?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`[shopify] fileCreate failed: ${userErrors.map((error) => error.message).join('; ')}`);
  }

  const createdFiles = data.fileCreate?.files ?? [];
  if (createdFiles.length !== files.length) {
    throw new Error(`[shopify] fileCreate returned ${createdFiles.length} files for ${files.length} inputs.`);
  }

  return Promise.all(createdFiles.map((file) => resolveRegisteredFileUrl(file)));
};

export { registerShopifyFiles };
