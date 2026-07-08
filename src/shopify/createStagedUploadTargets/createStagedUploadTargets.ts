import { shopifyAdminGraphql } from '@shopify/adminClient';
import type { stagedUploadFileInputType, stagedUploadTargetType } from '@shopify/stagedUpload';

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

type stagedUploadsCreateResponseType = {
  stagedUploadsCreate?: {
    stagedTargets?: stagedUploadTargetType[];
    userErrors?: { field?: string[] | null; message: string }[];
  };
};

/** Mints one or more Shopify staged-upload targets (Admin API only; binaries upload client-side). */
const createStagedUploadTargets = async (files: stagedUploadFileInputType[]): Promise<stagedUploadTargetType[]> => {
  if (!files.length) return [];

  const data = await shopifyAdminGraphql<stagedUploadsCreateResponseType>(STAGED_UPLOADS_CREATE_MUTATION, {
    input: files.map((file) => ({
      filename: file.filename,
      mimeType: file.mimeType,
      httpMethod: 'POST',
      resource: 'FILE',
      fileSize: file.fileSize.toString(),
    })),
  });

  const userErrors = data.stagedUploadsCreate?.userErrors ?? [];
  if (userErrors.length) {
    throw new Error(`[shopify] stagedUploadsCreate failed: ${userErrors.map((error) => error.message).join('; ')}`);
  }

  const targets = data.stagedUploadsCreate?.stagedTargets ?? [];
  if (targets.length !== files.length) {
    throw new Error(`[shopify] stagedUploadsCreate returned ${targets.length} targets for ${files.length} files.`);
  }

  return targets;
};

export { createStagedUploadTargets };
