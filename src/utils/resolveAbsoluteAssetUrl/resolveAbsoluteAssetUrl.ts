'use client';

const resolveAbsoluteAssetUrl = (src: string) => {
  if (!src) return '';
  if (/^(?:https?:|blob:|data:)/.test(src)) return src;
  return `${window.location.origin}${src.startsWith('/') ? src : `/${src}`}`;
};

export { resolveAbsoluteAssetUrl };
