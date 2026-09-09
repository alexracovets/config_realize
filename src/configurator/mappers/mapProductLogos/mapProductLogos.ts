import type { garmentConfigType, logoInstanceType, logoPositionConfigType, logoPositionType, uvBoundsType, uvPointType } from '@types';
import { FULL_UV_BOUNDS, LOGO_UPLOAD_ROTATION_DEG } from '@configurator/constants';
import { resolvePartUvBounds } from '@configurator/mappers';

const LOGO_STACK_INSET = 0.04;

const clampUvToPartBounds = (uv: uvPointType, bounds: uvBoundsType): uvPointType => {
  const minX = bounds.minX + LOGO_STACK_INSET;
  const maxX = bounds.maxX - LOGO_STACK_INSET;
  const minY = bounds.minY + LOGO_STACK_INSET;
  const maxY = bounds.maxY - LOGO_STACK_INSET;

  return {
    x: Math.min(Math.max(uv.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(uv.y, minY), Math.max(minY, maxY)),
  };
};

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

const isShortsProduct = (product: garmentConfigType) => product.parts.some((part) => part.label === 'Lacci');

const SHORTS_LOGO_PART_FRACTION = { x: 0.75, y: 0.67 };

const resolveLogoDefaults = (product: garmentConfigType) => {
  const shorts = isShortsProduct(product);
  const targetPart = shorts
    ? (product.parts.find((part) => part.id.endsWith('_back')) ?? product.parts[0])
    : (product.parts.find((part) => part.id.endsWith('_front')) ?? product.parts[0]);

  if (!targetPart) {
    throw new Error(`Product "${product.path}" has no parts for logo defaults.`);
  }

  const bounds = resolvePartUvBounds(targetPart);
  const fraction = shorts ? SHORTS_LOGO_PART_FRACTION : { x: 0.5, y: 0.5 };

  return {
    partId: targetPart.id,
    uv: {
      x: bounds.minX + (bounds.maxX - bounds.minX) * fraction.x,
      y: bounds.minY + (bounds.maxY - bounds.minY) * fraction.y,
    },
    rotation: 0,
    scale: 1,
  };
};

const createDynamicUserLogoPosition = (product: garmentConfigType, index: number): logoPositionType => {
  const defaults = resolveLogoDefaults(product);
  const part = product.parts.find((item) => item.id === defaults.partId) ?? product.parts[0];
  const partId = part?.id ?? defaults.partId;
  const bounds = part ? resolvePartUvBounds(part) : FULL_UV_BOUNDS;
  const uv = clampUvToPartBounds(defaults.uv, bounds);

  return {
    key: `logo-user-${index}`,
    label: `Logo ${index + 1}`,
    partId,
    uv,
    rotation: defaults.rotation,
    scale: defaults.scale,
    showFrame: true,
    showGizmo: true,
    interactive: true,
    isDefault: false,
  };
};

export { createDefaultLogoInstances, createDynamicUserLogoPosition, createLogoInstance, mapProductLogoPositions, resolveLogoDefaults, resolvePartIdForAtlasUv };
