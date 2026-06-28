import type { stampPixelSizeType } from '@configurator/types';
import type { Texture } from 'three';
type patternColorPairType = [string, string];
type patternMaskPairType = [Texture, Texture];

interface garmentPrintStateType {
  defaultLogos: Texture;
  patternMasks: patternMaskPairType;
  patternColors: patternColorPairType;
  patternOpacity: number;
}

interface garmentNameMaskStateType {
  mask: Texture;
}

interface garmentLogoStampStateType {
  stamp: Texture;
  cellSize: stampPixelSizeType;
}

interface gizmoFrameStateType {
  enabled: number;
  half: Array<{ x: number; y: number }>;
  frameActive: number[];
  gizmoActive: number[];
}

type nameSlotFloat4Type = [number, number, number, number];
type nameSlotColor4Type = [string, string, string, string];
type nameSlotVec2Type = [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
type nameSlotBounds4Type = [
  { minX: number; minY: number; maxX: number; maxY: number },
  { minX: number; minY: number; maxX: number; maxY: number },
  { minX: number; minY: number; maxX: number; maxY: number },
  { minX: number; minY: number; maxX: number; maxY: number },
];

interface nameStyleUniformsType {
  stampSize: stampPixelSizeType;
  anchorUv: nameSlotVec2Type;
  rotation: nameSlotFloat4Type;
  placementRotation: nameSlotFloat4Type;
  uploadRotation: nameSlotFloat4Type;
  partRotation: nameSlotFloat4Type;
  scale: nameSlotFloat4Type;
  lineHeight?: nameSlotFloat4Type;
  slotActive: nameSlotFloat4Type;
  partBounds: nameSlotBounds4Type;
  textColors: nameSlotColor4Type;
  strokeColors: nameSlotColor4Type;
}

type logoSlotFloat4Type = [number, number, number, number];
type logoSlotVec2Type = [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
type logoSlotBounds4Type = [
  { minX: number; minY: number; maxX: number; maxY: number },
  { minX: number; minY: number; maxX: number; maxY: number },
  { minX: number; minY: number; maxX: number; maxY: number },
  { minX: number; minY: number; maxX: number; maxY: number },
];

interface logoStyleUniformsType {
  stampCellSize: { width: number; height: number };
  anchorUv: logoSlotVec2Type;
  rotation: logoSlotFloat4Type;
  uploadRotation: logoSlotFloat4Type;
  partRotation: logoSlotFloat4Type;
  scale: logoSlotFloat4Type;
  slotActive: logoSlotFloat4Type;
  partBounds: logoSlotBounds4Type;
}

interface logoSlotUniformsType {
  anchorUv: logoSlotVec2Type;
  slotActive: logoSlotFloat4Type;
  partBounds: logoSlotBounds4Type;
}

export type {
  garmentLogoStampStateType,
  garmentNameMaskStateType,
  garmentPrintStateType,
  gizmoFrameStateType,
  logoSlotBounds4Type,
  logoSlotFloat4Type,
  logoSlotUniformsType,
  logoSlotVec2Type,
  logoStyleUniformsType,
  nameSlotBounds4Type,
  nameSlotColor4Type,
  nameSlotFloat4Type,
  nameSlotVec2Type,
  nameStyleUniformsType,
  patternColorPairType,
  patternMaskPairType,
};
