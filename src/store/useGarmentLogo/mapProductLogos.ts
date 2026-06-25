'use client';

import type { garmentConfigType, logoInstanceType, logoPositionConfigType, logoPositionType, uvPointType } from '@types';

import { LOGO_UPLOAD_ROTATION_DEG } from '@constants';
import { resolvePartUvBounds } from '@utils';

const resolvePartIdForAtlasUv = (product: garmentConfigType, uv: uvPointType): string => {
  const match = product.parts.find((part) => {
    const bounds = resolvePartUvBounds(part);
    return uv.x >= bounds.minX && uv.x <= bounds.maxX && uv.y >= bounds.minY && uv.y <= bounds.maxY;
  });

  if (!match) {
    throw new Error(`Product "${product.path}" has no part for logo UV (${uv.x}, ${uv.y}).`);
  }

  return match.id;
};

const mapLogoPosition = (product: garmentConfigType, position: logoPositionConfigType, index: number): logoPositionType => {
  const isDefault = position.default ?? Boolean(position.src);

  return {
    key: `logo-pos-${index}`,
    label: position.label,
    partId: position.partId ?? resolvePartIdForAtlasUv(product, position.uv),
    uv: position.uv,
    rotation: position.rotation,
    scale: position.scale,
    src: position.src,
    showFrame: position.show_frame ?? true,
    showGizmo: position.show_gizmo ?? position.interactive === true,
    interactive: position.interactive ?? !isDefault,
    isDefault,
  };
};

const mapProductLogoPositions = (product: garmentConfigType): logoPositionType[] =>
  (product.logoPositions ?? []).map((position, index) => mapLogoPosition(product, position, index));

const resolveLogoFileName = (src: string) => {
  const segments = src.split('/');
  return segments[segments.length - 1] || 'logo';
};

const createLogoInstance = (
  position: logoPositionType,
  id: string,
  options: {
    src: string;
    fileName?: string;
    isDefault?: boolean;
    naturalWidth?: number;
    naturalHeight?: number;
    uploadRotation?: number;
  },
): logoInstanceType => ({
  id,
  positionKey: position.key,
  label: position.label,
  partId: position.partId,
  uv: position.uv,
  rotation: position.rotation,
  scale: position.scale,
  src: options.src,
  fileName: options.fileName ?? resolveLogoFileName(options.src),
  isDefault: options.isDefault ?? position.isDefault,
  showFrame: (options.isDefault ?? position.isDefault) ? position.showFrame : true,
  showGizmo: (options.isDefault ?? position.isDefault) ? position.showGizmo : true,
  naturalWidth: options.naturalWidth ?? 0,
  naturalHeight: options.naturalHeight ?? 0,
  uploadRotation: options.uploadRotation ?? LOGO_UPLOAD_ROTATION_DEG,
  opacity: 1,
});

const createDefaultLogoInstances = (positions: logoPositionType[]): logoInstanceType[] =>
  positions
    .filter((position) => position.src)
    .map((position) =>
      createLogoInstance(position, `${position.key}_default`, {
        src: position.src!,
        isDefault: true,
      }),
    );

const resolveLogoDefaults = (product: garmentConfigType) => {
  const frontPart = product.parts.find((part) => part.label === 'Front') ?? product.parts[0];

  if (!frontPart) {
    throw new Error(`Product "${product.path}" has no parts for logo defaults.`);
  }

  const bounds = resolvePartUvBounds(frontPart);

  return {
    partId: frontPart.id,
    uv: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    },
    rotation: 0,
    scale: 1,
  };
};

const createDynamicUserLogoPosition = (product: garmentConfigType, index: number): logoPositionType => {
  const defaults = resolveLogoDefaults(product);
  const offset = index * 0.03;

  return {
    key: `logo-user-${index}`,
    label: `Logo ${index + 1}`,
    partId: defaults.partId,
    uv: { x: defaults.uv.x + offset, y: defaults.uv.y - offset },
    rotation: defaults.rotation,
    scale: defaults.scale,
    showFrame: true,
    showGizmo: true,
    interactive: true,
    isDefault: false,
  };
};

export { createDefaultLogoInstances, createDynamicUserLogoPosition, createLogoInstance, mapProductLogoPositions, resolveLogoDefaults, resolvePartIdForAtlasUv };
