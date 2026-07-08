'use client';

const ASSET_DOWNLOAD_ENDPOINT = '/api/download';

/**
 * Wraps a hosted asset URL into the app's download route, which serves it with
 * `Content-Disposition: attachment` — a click (e.g. from inside a PDF) downloads
 * the file instead of navigating away from the current tab.
 */
const buildAssetDownloadUrl = (fileUrl: string, filename: string) => {
  const downloadUrl = new URL(ASSET_DOWNLOAD_ENDPOINT, window.location.origin);
  downloadUrl.searchParams.set('url', fileUrl);
  downloadUrl.searchParams.set('filename', filename);
  return downloadUrl.toString();
};

export { buildAssetDownloadUrl };
