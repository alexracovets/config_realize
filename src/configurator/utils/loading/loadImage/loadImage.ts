const decodeImage = async (image: HTMLImageElement): Promise<HTMLImageElement> => {
  if (typeof image.decode !== 'function') return image;

  try {
    await image.decode();
  } catch {}

  return image;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  }).then(decodeImage);

export { loadImage };
