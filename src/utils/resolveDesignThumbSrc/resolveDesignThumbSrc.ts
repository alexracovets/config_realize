const DESIGN_PATH_MARKER = '/designs/';

const resolveDesignThumbThumbFileName = (fileName: string) => (fileName.toLowerCase().endsWith('.svg') ? fileName.replace(/\.svg$/i, '.webp') : fileName);

const resolveDesignThumbSrc = (designSrc: string) => {
  const markerIndex = designSrc.lastIndexOf(DESIGN_PATH_MARKER);
  if (markerIndex < 0) return designSrc;

  const prefix = designSrc.slice(0, markerIndex + DESIGN_PATH_MARKER.length);
  const fileName = designSrc.slice(markerIndex + DESIGN_PATH_MARKER.length);
  return `${prefix}thumbs/${resolveDesignThumbThumbFileName(fileName)}`;
};

export { resolveDesignThumbSrc };
