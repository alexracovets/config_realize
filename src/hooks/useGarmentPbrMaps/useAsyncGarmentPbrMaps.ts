'use client';

import { useEffect, useState } from 'react';

import { NoColorSpace, Texture } from 'three';

import type { pbrMapsType, pbrTexturePathsType } from '@types';
import { yieldToMain } from '@utils';

const loadPbrTexture = async (url: string): Promise<Texture> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  await yieldToMain();

  const texture = new Texture(bitmap);
  texture.colorSpace = NoColorSpace;
  texture.channel = 1;
  texture.flipY = false;
  texture.needsUpdate = true;

  return texture;
};

const useAsyncGarmentPbrMaps = (paths: pbrTexturePathsType): pbrMapsType | null => {
  const [maps, setMaps] = useState<pbrMapsType | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness] = await Promise.all([
        loadPbrTexture(paths.bakeNormal),
        loadPbrTexture(paths.bakeAoRoughness),
        loadPbrTexture(paths.fabricNormal),
        loadPbrTexture(paths.fabricRoughness),
      ]);

      if (cancelled) return;

      setMaps({ bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness });
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [paths.bakeAoRoughness, paths.bakeNormal, paths.fabricNormal, paths.fabricRoughness]);

  return maps;
};

export { useAsyncGarmentPbrMaps };
