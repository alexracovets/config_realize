'use client';

import { useMemo } from 'react';

import { useTexture } from '@react-three/drei';
import { NoColorSpace } from 'three';

import type { pbrMapsType, pbrTexturePathsType } from '@types';

const useGarmentPbrMaps = (paths: pbrTexturePathsType): pbrMapsType => {
  const { bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness } = useTexture({
    bakeNormal: paths.bakeNormal,
    bakeAoRoughness: paths.bakeAoRoughness,
    fabricNormal: paths.fabricNormal,
    fabricRoughness: paths.fabricRoughness,
  });

  useMemo(() => {
    for (const tex of [bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness]) {
      tex.colorSpace = NoColorSpace;
      tex.channel = 1;
      tex.flipY = false;
      tex.needsUpdate = true;
    }
  }, [bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness]);

  return { bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness };
};

export { useGarmentPbrMaps };
