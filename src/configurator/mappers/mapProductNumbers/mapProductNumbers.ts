import type { garmentConfigType, numberInstanceType, numberLimitsType, numberPositionType, textDefaultsConfigType, uvPointType } from '@types';
import { resolveGarmentPart, resolvePrintLocalUvToAtlas } from '@configurator/mappers';
const NUMBER_MAX_LENGTH = 2;
const NUMBER_DEFAULT_LINE_HEIGHT = 1.5;

// numberPositions UV is 0..1 inside the part; shader expects print-atlas coordinates.
const resolveNumberLocalUvToAtlas = (product: garmentConfigType, partId: string, localUv: uvPointType): uvPointType =>
  resolvePrintLocalUvToAtlas(resolveGarmentPart(product, partId, 'a number position'), localUv);

const resolveNumberDefaults = (product: garmentConfigType): textDefaultsConfigType => {
  if (!product.numberDefaults) {
    throw new Error(`Product "${product.path}" defines numberPositions but is missing numberDefaults.`);
  }

  return product.numberDefaults;
};

const resolveNumberLineHeightShow = (product: garmentConfigType) => resolveNumberDefaults(product).line_height_show ?? false;

const resolveNumberLimits = (product: garmentConfigType): numberLimitsType => {
  const defaults = resolveNumberDefaults(product);

  return {
    maxLength: NUMBER_MAX_LENGTH,
    fontSizeMin: defaults.fontSizeMin ?? 50,
    fontSizeMax: defaults.fontSizeMax ?? 500,
    strokeWidthMax: defaults.strokeWidthMax ?? 20,
    lineHeightMin: defaults.lineHeightMin ?? 0.5,
    lineHeightMax: defaults.lineHeightMax ?? 2,
  };
};

const mapProductNumberPositions = (product: garmentConfigType): numberPositionType[] =>
  (product.numberPositions ?? []).map((position, index) => ({
    key: `number-pos-${index}`,
    label: position.label,
    partId: resolveGarmentPart(product, position.partId, 'a number position').id,
    uv: resolveNumberLocalUvToAtlas(product, position.partId, position.uv),
    rotation: position.rotation,
    fontSize: position.fontSize,
    lineHeight: position.line_height,
    showFrame: position.show_frame ?? true,
    showGizmo: position.show_gizmo ?? position.interactive === true,
    interactive: position.interactive ?? true,
  }));

const sanitizeNumberText = (value: string) => value.replace(/\D/g, '').slice(0, NUMBER_MAX_LENGTH);

const createNumberInstance = (product: garmentConfigType, position: numberPositionType, id: string): numberInstanceType => {
  const defaults = resolveNumberDefaults(product);

  return {
    id,
    positionKey: position.key,
    label: position.label,
    partId: position.partId,
    uv: position.uv,
    rotation: 0,
    placementRotation: position.rotation,
    text: sanitizeNumberText(defaults.text),
    font: defaults.font,
    fontSize: position.fontSize,
    textColor: defaults.textColor,
    strokeColor: defaults.strokeColor,
    strokeWidth: defaults.strokeWidth,
    lineHeight: position.lineHeight ?? defaults.lineHeight ?? NUMBER_DEFAULT_LINE_HEIGHT,
    showFrame: position.showFrame,
    showGizmo: position.showGizmo,
  };
};

export {
  createNumberInstance,
  mapProductNumberPositions,
  resolveNumberDefaults,
  resolveNumberLimits,
  resolveNumberLineHeightShow,
  resolveNumberLocalUvToAtlas,
  sanitizeNumberText,
  NUMBER_DEFAULT_LINE_HEIGHT,
  NUMBER_MAX_LENGTH,
};
