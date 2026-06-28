import type { garmentConfigType, nameInstanceType, nameLimitsType, namePositionType, textDefaultsConfigType } from '@types';
import { resolveGarmentPart, resolvePrintLocalUvToAtlas } from '@configurator/mappers';
const resolveNameDefaults = (product: garmentConfigType): textDefaultsConfigType => {
  if (!product.nameDefaults) {
    throw new Error(`Product "${product.path}" defines namePositions but is missing nameDefaults.`);
  }

  return product.nameDefaults;
};

const resolveNameLimits = (product: garmentConfigType): nameLimitsType => {
  const defaults = resolveNameDefaults(product);

  return {
    maxLength: defaults.maxLength ?? 20,
    fontSizeMin: defaults.fontSizeMin ?? 50,
    fontSizeMax: defaults.fontSizeMax ?? 400,
    strokeWidthMax: defaults.strokeWidthMax ?? 20,
  };
};

const mapProductNamePositions = (product: garmentConfigType): namePositionType[] =>
  (product.namePositions ?? []).map((position, index) => ({
    key: `name-pos-${index}`,
    label: position.label,
    partId: position.partId,
    uv: resolvePrintLocalUvToAtlas(resolveGarmentPart(product, position.partId, 'a name position'), position.uv),
    rotation: position.rotation,
    fontSize: position.fontSize,
    showFrame: position.show_frame ?? true,
    showGizmo: position.show_gizmo ?? position.interactive === true,
    interactive: position.interactive ?? true,
  }));

const createNameInstance = (product: garmentConfigType, position: namePositionType, id: string): nameInstanceType => {
  const defaults = resolveNameDefaults(product);

  return {
    id,
    positionKey: position.key,
    label: position.label,
    partId: position.partId,
    uv: position.uv,
    rotation: 0,
    placementRotation: position.rotation,
    text: defaults.text,
    font: defaults.font,
    fontSize: position.fontSize,
    textColor: defaults.textColor,
    strokeColor: defaults.strokeColor,
    strokeWidth: defaults.strokeWidth,
    showFrame: position.showFrame,
    showGizmo: position.showGizmo,
  };
};

export { createNameInstance, mapProductNamePositions, resolveNameDefaults, resolveNameLimits };
