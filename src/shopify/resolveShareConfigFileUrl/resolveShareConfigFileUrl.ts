import { shopifyAdminGraphql } from '@shopify/adminClient';

import { SHARE_CONFIG_EXPORT_FILENAME_PREFIX } from '@constants';

const SHARE_FILE_QUERY = `#graphql
  query ShareConfigFile($query: String!) {
    files(first: 1, query: $query) {
      nodes {
        ... on GenericFile {
          url
        }
      }
    }
  }
`;

type shareFileQueryResultType = {
  files?: {
    nodes?: Array<{ url?: string | null } | null> | null;
  } | null;
};

const SHARE_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

const isValidShareId = (shareId: string): boolean => SHARE_ID_PATTERN.test(shareId);

const resolveShareConfigFileUrl = async (shareId: string): Promise<string | null> => {
  if (!isValidShareId(shareId)) {
    return null;
  }

  const filename = `${SHARE_CONFIG_EXPORT_FILENAME_PREFIX}-${shareId}.json`;

  const data = await shopifyAdminGraphql<shareFileQueryResultType>(SHARE_FILE_QUERY, {
    query: `filename:'${filename}'`,
  });

  return data.files?.nodes?.[0]?.url ?? null;
};

export { isValidShareId, resolveShareConfigFileUrl };
