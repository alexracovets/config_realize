const DESIGN_CARD_PREVIEW_DIR = '/svg/design';

/** Canonical card id, e.g. `design_01` … `design_10`. */
const normalizeDesignId = (value: string): string | null => {
  const trimmed = value.trim().toLowerCase();

  const fromDesignPrefix = trimmed.match(/^design[_-]?(\d{1,2})$/);
  if (fromDesignPrefix) {
    return `design_${fromDesignPrefix[1].padStart(2, '0')}`;
  }

  const fromNumber = trimmed.match(/^(\d{1,2})$/);
  if (fromNumber) {
    return `design_${fromNumber[1].padStart(2, '0')}`;
  }

  return null;
};

const parseDesignIdFromPatternName = (patternName: string): string | null => {
  const match = patternName.match(/design\s*(\d{1,2})/i);
  if (!match) return null;

  return `design_${match[1].padStart(2, '0')}`;
};

const resolvePatternDesignId = (patternName: string, designId?: string): string | null => {
  if (designId) {
    return normalizeDesignId(designId);
  }

  return parseDesignIdFromPatternName(patternName);
};

const resolveDesignCardPreviewSrc = (patternName: string, designId?: string): string => {
  const id = resolvePatternDesignId(patternName, designId);
  if (!id) return '';

  return `${DESIGN_CARD_PREVIEW_DIR}/${id}.svg`;
};

export { normalizeDesignId, parseDesignIdFromPatternName, resolveDesignCardPreviewSrc, resolvePatternDesignId };
