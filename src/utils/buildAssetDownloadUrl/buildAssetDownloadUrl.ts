'use client';

const ASSET_DOWNLOAD_ENDPOINT = '/api/download';

const buildAssetDownloadUrl = (fileUrl: string, filename: string) => {
  const downloadUrl = new URL(ASSET_DOWNLOAD_ENDPOINT, window.location.origin);
  downloadUrl.searchParams.set('url', fileUrl);
  downloadUrl.searchParams.set('filename', filename);
  return downloadUrl.toString();
};

export { buildAssetDownloadUrl };
