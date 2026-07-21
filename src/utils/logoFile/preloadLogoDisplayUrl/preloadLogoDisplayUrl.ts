'use client';

const preloadLogoDisplayUrl = async (src: string): Promise<void> => {
  if (typeof window === 'undefined' || !('createImageBitmap' in window)) return;
  try {
    const blob = await fetch(src).then((r) => r.blob());
    const bitmap = await createImageBitmap(blob);
    bitmap.close();
  } catch {

  }
};

const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

export { preloadLogoDisplayUrl, yieldToMain };
