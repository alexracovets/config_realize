import type { garmentConfigType } from '@types';
import { resolveModelUrl } from '@configurator/utils';
const warmedModelUrls = new Set<string>();

const warmModelFile = (url: string) => {
  if (typeof window === 'undefined' || warmedModelUrls.has(url)) return;

  warmedModelUrls.add(url);

  void fetch(url, { priority: 'low' }).catch(() => {
    warmedModelUrls.delete(url);
  });
};

/** Low-priority fetch of the product GLB file (network warm-up). */
const warmProductModelFile = (product: garmentConfigType) => {
  warmModelFile(resolveModelUrl(product));
};

export { warmProductModelFile };
