import { loadImage } from '@configurator/utils';
const imageCache = new Map<string, Promise<HTMLImageElement>>();

const loadCachedImage = (src: string): Promise<HTMLImageElement> => {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = loadImage(src);
  imageCache.set(src, promise);
  promise.catch(() => imageCache.delete(src));

  return promise;
};

export { loadCachedImage };
