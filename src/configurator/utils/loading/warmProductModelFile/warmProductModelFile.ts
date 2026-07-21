import type { garmentConfigType } from '@types';
import { resolveModelUrl } from '@configurator/utils';

type warmProductModelFileOptionsType = {
  priority?: RequestPriority;
};

const warmedModelUrls = new Set<string>();

const warmModelFile = (url: string, options?: warmProductModelFileOptionsType) => {
  if (typeof window === 'undefined' || warmedModelUrls.has(url)) return;

  warmedModelUrls.add(url);

  void fetch(url, { priority: options?.priority ?? 'low' }).catch(() => {
    warmedModelUrls.delete(url);
  });
};

const warmProductModelFile = (product: garmentConfigType, options?: warmProductModelFileOptionsType) => {
  warmModelFile(resolveModelUrl(product), options);
};

export { warmProductModelFile };
export type { warmProductModelFileOptionsType };
