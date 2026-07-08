import { resolveAbsoluteAssetUrl } from '@utils/resolveAbsoluteAssetUrl';

const EXPORT_DOCUMENT_WAIT_ATTEMPTS = 30;
const EXPORT_DOCUMENT_WAIT_DELAY_MS = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits until a hidden export document is mounted, then clones it into an offscreen capture host. */
const waitAndCloneDocumentForCapture = async (
  testId: string,
): Promise<{ element: HTMLElement; dispose: () => void } | null> => {
  let source: HTMLElement | null = null;

  for (let attempt = 0; attempt < EXPORT_DOCUMENT_WAIT_ATTEMPTS; attempt += 1) {
    const candidate = document.querySelector(`[data-testid="${testId}"]`);
    if (candidate instanceof HTMLElement) {
      source = candidate;
      break;
    }

    await sleep(EXPORT_DOCUMENT_WAIT_DELAY_MS);
  }

  if (!source) return null;

  const styleElement = source.parentElement?.querySelector('style') ?? null;

  const captureHost = document.createElement('div');
  captureHost.style.cssText = `position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;background:#fff;width:${source.scrollWidth}px;`;
  if (styleElement) captureHost.appendChild(styleElement.cloneNode(true));
  captureHost.appendChild(source.cloneNode(true));
  document.body.appendChild(captureHost);

  const cloned = captureHost.querySelector(`[data-testid="${testId}"]`);
  if (!(cloned instanceof HTMLElement)) {
    captureHost.remove();
    return null;
  }

  cloned.querySelectorAll('img').forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    const src = image.getAttribute('src');
    if (!src || /^(?:https?:|blob:|data:)/.test(src)) return;
    image.src = resolveAbsoluteAssetUrl(src);
  });

  return { element: cloned, dispose: () => captureHost.remove() };
};

export { waitAndCloneDocumentForCapture };
