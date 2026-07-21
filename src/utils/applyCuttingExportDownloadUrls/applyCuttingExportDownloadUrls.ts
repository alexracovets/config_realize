type cuttingExportDownloadUrlEntryType = {
  cartItemId: string;
  label: string;
  url: string;
};

const buildCuttingExportDownloadUrlKey = (cartItemId: string, label: string) => `${cartItemId}::${label}`;

const resolveCuttingExportDownloadAnchorMeta = (anchor: HTMLAnchorElement) => {
  const productSection = anchor.closest('.cutting-export__product');
  const cartItemId = anchor.dataset.cartItemId?.trim() || (productSection instanceof HTMLElement ? productSection.dataset.cartItemId?.trim() : undefined) || '';
  const label = anchor.dataset.downloadLabel?.trim() || anchor.querySelector('.cutting-export__download-label')?.textContent?.trim() || '';

  return { cartItemId, label };
};

const applyCuttingExportDownloadUrls = (documentRoot: HTMLElement, entries: cuttingExportDownloadUrlEntryType[]): void => {
  const urlByCartAndLabel = new Map(entries.map((entry) => [buildCuttingExportDownloadUrlKey(entry.cartItemId, entry.label), entry.url]));

  documentRoot.querySelectorAll('a.cutting-export__download-card').forEach((anchor) => {
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const { cartItemId, label } = resolveCuttingExportDownloadAnchorMeta(anchor);
    if (!label) return;

    const url = cartItemId ? urlByCartAndLabel.get(buildCuttingExportDownloadUrlKey(cartItemId, label)) : undefined;
    if (!url) return;

    anchor.setAttribute('href', url);

    const image = anchor.querySelector('img');
    if (image instanceof HTMLImageElement) {
      image.src = url;
    }
  });
};

export { applyCuttingExportDownloadUrls, resolveCuttingExportDownloadAnchorMeta };
export type { cuttingExportDownloadUrlEntryType };
