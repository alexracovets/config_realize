const designSvgTextCache = new Map<string, Promise<string>>();

const loadDesignSvgText = (src: string): Promise<string> => {
  const cached = designSvgTextCache.get(src);
  if (cached) return cached;

  const request = fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load design SVG: ${src}`);
      }

      return response.text();
    })
    .catch((error) => {
      designSvgTextCache.delete(src);
      throw error;
    });

  designSvgTextCache.set(src, request);
  return request;
};

export { loadDesignSvgText };
