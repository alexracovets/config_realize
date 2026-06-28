import type { garmentConfigType, testoInstanceType, testoLimitsType, testoPositionType, textDefaultsConfigType } from '@types';
import { resolveGarmentPart, resolvePrintLocalUvToAtlas } from '@configurator/mappers';
const TESTO_DEFAULT_LINE_HEIGHT = 1.5;
const TESTO_DEFAULT_LETTER_SPACING = 0;

const resolveTestoDefaults = (product: garmentConfigType): textDefaultsConfigType => {
  if (!product.testoDefaults) {
    throw new Error(`Product "${product.path}" defines testoPositions but is missing testoDefaults.`);
  }

  return product.testoDefaults;
};

const resolveTestoLineHeightShow = (product: garmentConfigType) => resolveTestoDefaults(product).line_height_show ?? true;

const resolveTestoLetterSpacingShow = (product: garmentConfigType) => resolveTestoDefaults(product).letter_spacing_show ?? true;

const resolveTestoLimits = (product: garmentConfigType): testoLimitsType => {
  const defaults = resolveTestoDefaults(product);

  return {
    maxLength: defaults.maxLength ?? 20,
    fontSizeMin: defaults.fontSizeMin ?? 50,
    fontSizeMax: defaults.fontSizeMax ?? 400,
    strokeWidthMax: defaults.strokeWidthMax ?? 20,
    lineHeightMin: defaults.lineHeightMin ?? 0.5,
    lineHeightMax: defaults.lineHeightMax ?? 2,
    letterSpacingMin: defaults.letterSpacingMin ?? -20,
    letterSpacingMax: defaults.letterSpacingMax ?? 80,
  };
};

const mapProductTestoPositions = (product: garmentConfigType): testoPositionType[] =>
  (product.testoPositions ?? []).map((position, index) => ({
    key: `testo-pos-${index}`,
    label: position.label,
    partId: position.partId,
    uv: resolvePrintLocalUvToAtlas(resolveGarmentPart(product, position.partId, 'a testo position'), position.uv),
    rotation: position.rotation,
    fontSize: position.fontSize,
    lineHeight: position.line_height,
    letterSpacing: position.letter_spacing,
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
  resolveTestoLimits,
  resolveTestoLineHeightShow,
  TESTO_DEFAULT_LETTER_SPACING,
  TESTO_DEFAULT_LINE_HEIGHT,
};
