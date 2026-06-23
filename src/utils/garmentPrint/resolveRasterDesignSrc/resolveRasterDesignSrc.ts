const resolveRasterDesignSrc = (src: string) => (src.toLowerCase().endsWith('.svg') ? src.replace(/\.svg$/i, '.webp') : src);

export { resolveRasterDesignSrc };
