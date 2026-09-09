import { resolveShareConfigFileUrl } from '@shopify/resolveShareConfigFileUrl';

import type { shareConfigExportType } from '@utils/buildShareConfigExport';
import { parseShareConfigExport } from '@utils/buildShareConfigExport';

const SHARE_FETCH_TIMEOUT_MS = 8000;

const fetchSharedConfiguration = async (shareId: string): Promise<shareConfigExportType | null> => {
  try {
    const fileUrl = await resolveShareConfigFileUrl(shareId);
    if (!fileUrl) return null;

    const response = await fetch(fileUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(SHARE_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`[share] Shared configuration HTTP ${response.status}`);
    }

    return parseShareConfigExport(await response.json());
  } catch (error) {
    console.error(`[share] Failed to resolve shared configuration "${shareId}".`, error);
    return null;
  }
};

export { fetchSharedConfiguration };
