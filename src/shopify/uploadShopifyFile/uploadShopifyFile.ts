import { shopifyAdminGraphql } from '@shopify/adminClient';

const STAGED_UPLOADS_CREATE_MUTATION = `#graphql
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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

type stagedTargetType = {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
};

type stagedUploadsCreateResponseType = {
  stagedUploadsCreate?: {
    stagedTargets?: stagedTargetType[];
    userErrors?: { field?: string[] | null; message: string }[];
  };
};

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

const resolveFileUrl = (file: fileNodeType): string | null => file.url ?? file.image?.url ?? null;

const FILE_STATUS_POLL_ATTEMPTS = 3;
const FILE_STATUS_POLL_DELAY_MS = 1_500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pollFileUrl = async (fileId: string): Promise<string | null> => {
  for (let attempt = 0; attempt < FILE_STATUS_POLL_ATTEMPTS; attempt += 1) {
    await sleep(FILE_STATUS_POLL_DELAY_MS);
    const data = await shopifyAdminGraphql<fileStatusResponseType>(FILE_STATUS_QUERY, { id: fileId });
    const url = data.node ? resolveFileUrl(data.node) : null;
    if (url) return url;
  }

  return null;
};

const createStagedTarget = async (filename: string, mimeType: string, fileSize: number): Promise<stagedTargetType> => {
  const data = await shopifyAdminGraphql<stagedUploadsCreateResponseType>(STAGED_UPLOADS_CREATE_MUTATION, {
    input: [
      {
        filename,
        mimeType,
        httpMethod: 'POST',
        resource: 'FILE',
        fileSize: fileSize.toString(),
      },
    ],
  });

  const userErrors = data.stagedUploadsCreate?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`[shopify] stagedUploadsCreate failed: ${userErrors.map((error) => error.message).join('; ')}`);
  }

  const target = data.stagedUploadsCreate?.stagedTargets?.[0];
  if (!target) {
    throw new Error('[shopify] stagedUploadsCreate returned no staged target.');
  }

  return target;
};

const uploadToStagedTarget = async (target: stagedTargetType, file: Blob): Promise<void> => {
  const formData = new FormData();
  target.parameters.forEach(({ name, value }) => formData.append(name, value));
  formData.append('file', file);

  const response = await fetch(target.url, { method: 'POST', body: formData });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`[shopify] Staged upload HTTP ${response.status}: ${response.statusText} ${body}`.trim());
  }
};

const createShopifyFile = async (resourceUrl: string, contentType: 'FILE' | 'IMAGE'): Promise<string> => {
  const data = await shopifyAdminGraphql<fileCreateResponseType>(FILE_CREATE_MUTATION, {
    files: [{ originalSource: resourceUrl, contentType }],
  });

  const userErrors = data.fileCreate?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`[shopify] fileCreate failed: ${userErrors.map((error) => error.message).join('; ')}`);
  }

  const file = data.fileCreate?.files?.[0];
  if (!file) {
    throw new Error('[shopify] fileCreate returned no file.');
  }

  const immediateUrl = resolveFileUrl(file);
  if (immediateUrl) return immediateUrl;

  const polledUrl = await pollFileUrl(file.id);
  if (polledUrl) return polledUrl;

  throw new Error(`[shopify] File "${file.id}" did not finish processing in time.`);
};

/** Uploads a file to Shopify Files (staged upload -> fileCreate) and returns its public CDN URL. */
const uploadShopifyFile = async (file: Blob, filename: string, mimeType: string): Promise<string> => {
  const contentType: 'FILE' | 'IMAGE' = mimeType.startsWith('image/') ? 'IMAGE' : 'FILE';

  const target = await createStagedTarget(filename, mimeType, file.size);
  await uploadToStagedTarget(target, file);
  return createShopifyFile(target.resourceUrl, contentType);
};

export { uploadShopifyFile };
