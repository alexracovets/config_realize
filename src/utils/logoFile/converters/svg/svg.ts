'use client';

import { nativeFileToDisplayUrl } from '@utils/logoFile/converters/nativeImage';
import { LogoFileError } from '@utils/logoFile/logoFileError';

const SVG_FALLBACK_SIZE_PX = 1024;

const isConcreteLength = (value: string | null): boolean => !!value && !value.trim().endsWith('%');

const normalizeSvgFileToDisplayUrl = async (file: File): Promise<string> => {
  const text = await file.text();
  const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = parsed.documentElement;

  if (root.tagName.toLowerCase() !== 'svg' || parsed.querySelector('parsererror')) {
    throw new LogoFileError('File SVG non valido');
  }

  if (isConcreteLength(root.getAttribute('width')) && isConcreteLength(root.getAttribute('height'))) {
    return nativeFileToDisplayUrl(file);
  }

  const viewBox =
    root
      .getAttribute('viewBox')
      ?.trim()
      .split(/[\s,]+/)
      .map(Number) ?? [];
  const [, , viewBoxWidth, viewBoxHeight] = viewBox;
  const hasViewBox = viewBox.length === 4 && viewBoxWidth! > 0 && viewBoxHeight! > 0;

  const width = hasViewBox ? viewBoxWidth! : SVG_FALLBACK_SIZE_PX;
  const height = hasViewBox ? viewBoxHeight! : SVG_FALLBACK_SIZE_PX;

  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  if (!hasViewBox) root.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const normalized = new XMLSerializer().serializeToString(root);
  return URL.createObjectURL(new Blob([normalized], { type: 'image/svg+xml' }));
};

export { normalizeSvgFileToDisplayUrl };
