'use client';

const DOWNLOAD_URL_REVOKE_DELAY_MS = 10_000;

const triggerPdfDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), DOWNLOAD_URL_REVOKE_DELAY_MS);
};

export { triggerPdfDownload };
