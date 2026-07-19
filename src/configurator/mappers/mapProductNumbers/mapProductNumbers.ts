import type {
  garmentConfigType,
  numberInstanceType,
  numberLimitsType,
  numberPositionType,
  printCmScaleType,
  textDefaultsConfigType,
  uvPointType,
} from '@types';
import {
  resolveCmLimitPx,
  resolveGarmentPart,
  resolvePrintLocalUvToAtlas,
  resolveTextPrintPositionLimits,
  TEXT_PRINT_MIN_CM,
  TEXT_PRINT_UNBOUNDED_CM,
} from '@configurator/mappers';
const NUMBER_MAX_LENGTH = 2;
const NUMBER_DEFAULT_LINE_HEIGHT = 1.5;

const NUMBER_LIMITS_FALLBACK_CM = { heightMinCm: TEXT_PRINT_MIN_CM, heightMaxCm: 27, widthMinCm: TEXT_PRINT_MIN_CM, widthMaxCm: TEXT_PRINT_UNBOUNDED_CM };

const resolveNumberLocalUvToAtlas = (product: garmentConfigType, partId: string, localUv: uvPointType): uvPointType =>
  resolvePrintLocalUvToAtlas(resolveGarmentPart(product, partId, 'a number position'), localUv);

const resolveNumberDefaults = (product: garmentConfigType): textDefaultsConfigType => {
  if (!product.numberDefaults) {
    throw new Error(`Product "${product.path}" defines numberPositions but is missing numberDefaults.`);
  }

  return product.numberDefaults;
};

const resolveNumberLineHeightShow = (product: garmentConfigType) => resolveNumberDefaults(product).line_height_show ?? false;

const resolveNumberPositionLimits = (product: garmentConfigType, position: numberPositionType, cmScale?: printCmScaleType | null): numberLimitsType => {
  const defaults = resolveNumberDefaults(product);
  const { heightMin, heightMax, widthMin, widthMax } = resolveTextPrintPositionLimits(position, cmScale, NUMBER_LIMITS_FALLBACK_CM);

  return {
    maxLength: NUMBER_MAX_LENGTH,
    heightMin,
    heightMax,
    widthMin,
    widthMax,
    strokeWidthMax: resolveCmLimitPx(defaults.strokeWidthMaxCm, defaults.strokeWidthMax ?? 20, cmScale?.cmPerPxVertical),
    lineHeightMin: defaults.lineHeightMin ?? 0.5,
    lineHeightMax: defaults.lineHeightMax ?? 2,
  };
};

const mapProductNumberPositions = (product: garmentConfigType): numberPositionType[] =>
  (product.numberPositions ?? []).map((position, index) => ({
    key: `number-pos-${index}`,
    positionId: position.id,
    conflicts: position.conflicts,
    label: position.label,
    partId: resolveGarmentPart(product, position.partId, 'a number position').id,
    uv: resolveNumberLocalUvToAtlas(product, position.partId, position.uv),
    rotation: position.rotation,
    fontSize: position.fontSize,
    src: position.src,
    lineHeight: position.line_height,
    heightMinCm: position.heightMinCm,
    heightMaxCm: position.heightMaxCm,
    widthMinCm: position.widthMinCm,
    widthMaxCm: position.widthMaxCm,
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
  resolveNumberLineHeightShow,
  resolveNumberLocalUvToAtlas,
  resolveNumberPositionLimits,
  sanitizeNumberText,
  NUMBER_DEFAULT_LINE_HEIGHT,
  NUMBER_MAX_LENGTH,
};
