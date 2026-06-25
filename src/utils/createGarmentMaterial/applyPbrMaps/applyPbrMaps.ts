import {
  DataTexture,
  FrontSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  TangentSpaceNormalMap,
  type Texture,
  Vector2,
} from 'three';

import type { pbrMapsType } from '@types';

const FABRIC_REPEAT = 10;

const cloneMap = (source: Texture, channel: 0 | 1, repeat = false) => {
  const tex = source.clone();
  tex.channel = channel;
  tex.flipY = false;
  tex.colorSpace = NoColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.anisotropy = 16;
  if (repeat) {
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT);
  }
  tex.needsUpdate = true;
  return tex;
};

const createDummyNormal = () => {
  const tex = new DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1, RGBAFormat);
  tex.needsUpdate = true;
  return tex;
};

const applyGarmentPrintBase = (material: MeshStandardMaterial) => {
  material.color.set('#ffffff');
  material.metalness = 0;
  material.roughness = material.roughness > 0 ? material.roughness : 0.92;
  material.envMapIntensity = 0.48;
  material.normalMap = material.normalMap ?? createDummyNormal();
  material.normalMapType = TangentSpaceNormalMap;
  material.normalScale = material.normalScale ?? new Vector2(0.5, 0.5);
  material.side = FrontSide;
  material.needsUpdate = true;
};

const applyPbrMaps = (material: MeshStandardMaterial, maps: pbrMapsType, pbrUvChannel: 0 | 1 = 1) => {
  material.map = null;
  material.color.set('#ffffff');
  material.emissive.set('#000000');
  material.metalnessMap = null;
  material.lightMap = null;
  material.emissiveMap = null;
  material.displacementMap = null;
  material.alphaMap = null;
  material.aoMap = cloneMap(maps.bakeAoRoughness, pbrUvChannel);
  material.aoMapIntensity = 0.42;
  material.roughnessMap = null;
  material.roughness = 0.92;
  material.metalness = 0;
  material.envMapIntensity = 0.48;
  material.normalMap = cloneMap(maps.bakeNormal, pbrUvChannel);
  material.normalMapType = TangentSpaceNormalMap;
  material.normalScale = new Vector2(0.5, 0.5);
  material.userData.pbrUvChannel = pbrUvChannel;
  material.side = FrontSide;
  material.needsUpdate = true;
};

export { applyGarmentPrintBase, applyPbrMaps, createDummyNormal };
