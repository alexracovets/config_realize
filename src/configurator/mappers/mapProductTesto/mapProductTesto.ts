import type { garmentConfigType, printCmScaleType, testoInstanceType, testoLimitsType, testoPositionType, textDefaultsConfigType } from '@types';
import { resolveCmLimitPx, resolveGarmentPart, resolvePrintLocalUvToAtlas, resolveTextPrintPositionLimits, TEXT_PRINT_MIN_CM } from '@configurator/mappers';
const TESTO_DEFAULT_LINE_HEIGHT = 1.5;
const TESTO_DEFAULT_LETTER_SPACING = 0;

const TESTO_LIMITS_FALLBACK_CM = { heightMinCm: TEXT_PRINT_MIN_CM, heightMaxCm: 2, widthMinCm: TEXT_PRINT_MIN_CM, widthMaxCm: 25 };

const resolveTestoDefaults = (product: garmentConfigType): textDefaultsConfigType => {
  if (!product.testoDefaults) {
    throw new Error(`Product "${product.path}" defines testoPositions but is missing testoDefaults.`);
  }

  return product.testoDefaults;
};

const resolveTestoLineHeightShow = (product: garmentConfigType) => resolveTestoDefaults(product).line_height_show ?? true;

const resolveTestoLetterSpacingShow = (product: garmentConfigType) => resolveTestoDefaults(product).letter_spacing_show ?? true;

const resolveTestoPositionLimits = (product: garmentConfigType, position: testoPositionType, cmScale?: printCmScaleType | null): testoLimitsType => {
  const defaults = resolveTestoDefaults(product);
  const { heightMin, heightMax, widthMin, widthMax } = resolveTextPrintPositionLimits(position, cmScale, TESTO_LIMITS_FALLBACK_CM);

  return {
    maxLength: defaults.maxLength ?? 20,
    heightMin,
    heightMax,
    widthMin,
    widthMax,
    strokeWidthMax: resolveCmLimitPx(defaults.strokeWidthMaxCm, defaults.strokeWidthMax ?? 20, cmScale?.cmPerPxVertical),
    lineHeightMin: defaults.lineHeightMin ?? 0.5,
    lineHeightMax: defaults.lineHeightMax ?? 2,
    letterSpacingMin: resolveCmLimitPx(defaults.letterSpacingMinCm, defaults.letterSpacingMin ?? -20, cmScale?.cmPerPxHorizontal),
    letterSpacingMax: resolveCmLimitPx(defaults.letterSpacingMaxCm, defaults.letterSpacingMax ?? 80, cmScale?.cmPerPxHorizontal),
  };
};

const mapProductTestoPositions = (product: garmentConfigType): testoPositionType[] =>
  (product.testoPositions ?? []).map((position, index) => ({
    key: `testo-pos-${index}`,
    positionId: position.id,
    conflicts: position.conflicts,
    relation: position.relation,
    label: position.label,
    partId: position.partId,
    uv: resolvePrintLocalUvToAtlas(resolveGarmentPart(product, position.partId, 'a testo position'), position.uv),
    rotation: position.rotation,
    fontSize: position.fontSize,
    src: position.src,
    lineHeight: position.line_height,
    letterSpacing: position.letter_spacing,
    heightMinCm: position.heightMinCm,
    heightMaxCm: position.heightMaxCm,
    widthMinCm: position.widthMinCm,
    widthMaxCm: position.widthMaxCm,
    showFrame: position.show_frame ?? true,
    showGizmo: position.show_gizmo ?? position.interactive === true,
    interactive: position.interactive ?? true,
  }));

const createTestoInstance = (product: garmentConfigType, position: testoPositionType, id: string): testoInstanceType => {
  const defaults = resolveTestoDefaults(product);

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
    lineHeight: position.lineHeight ?? defaults.lineHeight ?? TESTO_DEFAULT_LINE_HEIGHT,
    letterSpacing: position.letterSpacing ?? defaults.letterSpacing ?? TESTO_DEFAULT_LETTER_SPACING,
    showFrame: position.showFrame,
    showGizmo: position.showGizmo,
  };
};

export {
  createTestoInstance,
  mapProductTestoPositions,
  resolveTestoDefaults,
  resolveTestoLetterSpacingShow,
  resolveTestoLineHeightShow,
  resolveTestoPositionLimits,
  TESTO_DEFAULT_LETTER_SPACING,
  TESTO_DEFAULT_LINE_HEIGHT,
};
