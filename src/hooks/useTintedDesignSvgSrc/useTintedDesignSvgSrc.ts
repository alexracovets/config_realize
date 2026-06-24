'use client';

import { useEffect, useState } from 'react';

import { applyDesignSvgLayerColors, designSvgTextToDataUrl, loadDesignSvgText } from '@utils';

const useTintedDesignSvgSrc = (src: string, layerColors?: string[]) => {
  const shouldTint = Boolean(layerColors?.length);
  const colorsKey = layerColors?.join('|') ?? '';
  const [tintedSrc, setTintedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldTint || !layerColors?.length) return;

    let cancelled = false;

    void loadDesignSvgText(src)
      .then((svgText) => {
        if (cancelled) return;

        const tintedSvg = applyDesignSvgLayerColors(svgText, layerColors);
        setTintedSrc(designSvgTextToDataUrl(tintedSvg));
      })
      .catch(() => {
        if (!cancelled) setTintedSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src, colorsKey, shouldTint, layerColors]);

  if (!shouldTint) return src;

  return tintedSrc ?? src;
};

export { useTintedDesignSvgSrc };
