import type { garmentConfigType, nameInstanceType, nameLimitsType, namePositionType, printCmScaleType, textDefaultsConfigType } from '@types';
import { resolveCmLimitPx, resolveGarmentPart, resolvePrintLocalUvToAtlas, resolveTextPrintPositionLimits, TEXT_PRINT_MIN_CM } from '@configurator/mappers';
const resolveNameDefaults = (product: garmentConfigType): textDefaultsConfigType => {
  if (!product.nameDefaults) {
    throw new Error(`Product "${product.path}" defines namePositions but is missing nameDefaults.`);
  }

  return product.nameDefaults;
};

const NAME_LIMITS_FALLBACK_CM = { heightMinCm: TEXT_PRINT_MIN_CM, heightMaxCm: 6, widthMinCm: TEXT_PRINT_MIN_CM, widthMaxCm: 35 };

const resolveNamePositionLimits = (product: garmentConfigType, position: namePositionType, cmScale?: printCmScaleType | null): nameLimitsType => {
  const defaults = resolveNameDefaults(product);
  const { heightMin, heightMax, widthMin, widthMax } = resolveTextPrintPositionLimits(position, cmScale, NAME_LIMITS_FALLBACK_CM);

  return {
    maxLength: defaults.maxLength ?? 20,
    heightMin,
    heightMax,
    widthMin,
    widthMax,
    strokeWidthMax: resolveCmLimitPx(defaults.strokeWidthMaxCm, defaults.strokeWidthMax ?? 20, cmScale?.cmPerPxVertical),
  };
};

const mapProductNamePositions = (product: garmentConfigType): namePositionType[] =>
  (product.namePositions ?? []).map((position, index) => ({
    key: `name-pos-${index}`,
    positionId: position.id,
    conflicts: position.conflicts,
    label: position.label,
    partId: position.partId,
    uv: resolvePrintLocalUvToAtlas(resolveGarmentPart(product, position.partId, 'a name position'), position.uv),
    rotation: position.rotation,
    fontSize: position.fontSize,
    src: position.src,
    heightMinCm: position.heightMinCm,
    heightMaxCm: position.heightMaxCm,
    widthMinCm: position.widthMinCm,
    widthMaxCm: position.widthMaxCm,
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

export { createNameInstance, mapProductNamePositions, resolveNameDefaults, resolveNamePositionLimits };
