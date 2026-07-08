'use client';

const DOWNLOAD_URL_REVOKE_DELAY_MS = 10_000;

/** Triggers a browser download for the blob. Revoke is delayed — a sync revoke aborts the download in Safari/Firefox. */
const triggerPdfDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), DOWNLOAD_URL_REVOKE_DELAY_MS);
};

export { triggerPdfDownload };
