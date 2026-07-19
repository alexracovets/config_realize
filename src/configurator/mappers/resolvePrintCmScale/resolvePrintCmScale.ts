import type { garmentConfigType, garmentPartConfigType, printCmScaleType, printReferenceCmType } from '@types';

const DEFAULT_PRINT_REFERENCE_CM: printReferenceCmType = { heightCm: 70, widthCm: 50 };

const PRINT_CM_STEP = 0.1;

const uvArea = (part: garmentPartConfigType): number => {
  const bounds = part.uvBounds;
  if (!bounds) return 0;
  return Math.max(0, bounds.maxX - bounds.minX) * Math.max(0, bounds.maxY - bounds.minY);
};

const resolvePrimaryPart = (parts: garmentPartConfigType[]): garmentPartConfigType | null => {
  const withBounds = parts.filter((part) => part.uvBounds);
  if (withBounds.length === 0) return null;
  return withBounds.reduce((largest, part) => (uvArea(part) > uvArea(largest) ? part : largest));
};

const resolvePrintCmScale = (product: garmentConfigType, reference?: printReferenceCmType | null): printCmScaleType | null => {
  const atlas = product.printAtlas;
  if (!atlas) return null;

  const part = resolvePrimaryPart(product.parts);
  if (!part?.uvBounds) return null;

  const panelWidthPx = (part.uvBounds.maxX - part.uvBounds.minX) * atlas.width;
  const panelHeightPx = (part.uvBounds.maxY - part.uvBounds.minY) * atlas.height;
  if (panelWidthPx <= 0 || panelHeightPx <= 0) return null;

  const measurements = reference ?? DEFAULT_PRINT_REFERENCE_CM;

  const upright: printCmScaleType = {
    cmPerPxHorizontal: measurements.widthCm / panelWidthPx,
    cmPerPxVertical: measurements.heightCm / panelHeightPx,
  };
  const sideways: printCmScaleType = {
    cmPerPxHorizontal: measurements.widthCm / panelHeightPx,
    cmPerPxVertical: measurements.heightCm / panelWidthPx,
  };

  const anisotropy = (scale: printCmScaleType) => Math.abs(Math.log(scale.cmPerPxVertical / scale.cmPerPxHorizontal));

  return anisotropy(upright) <= anisotropy(sideways) ? upright : sideways;
};

const cmToPx = (cm: number, cmPerPx: number): number => cm / cmPerPx;

const pxToCm = (px: number, cmPerPx: number): number => px * cmPerPx;

const formatCm = (cm: number): string => `${cm.toFixed(1)} cm`;

const formatPxAsCm = (px: number, cmPerPx: number): string => formatCm(pxToCm(px, cmPerPx));

interface printUnitType {
  isCm: boolean;
  toUnit: (px: number) => number;
  toPx: (value: number) => number;
  formatUnit: (value: number) => string;
  formatPx: (px: number) => string;
  step: number;
}

const createPrintUnit = (cmPerPx: number | null | undefined): printUnitType => {
  if (!cmPerPx || cmPerPx <= 0) {
    return {
      isCm: false,
      toUnit: (px) => Math.round(px),
      toPx: (value) => value,
      formatUnit: (value) => `${Math.round(value)}px`,
      formatPx: (px) => `${Math.round(px)}px`,
      step: 1,
    };
  }

  return {
    isCm: true,
    toUnit: (px) => Math.round(pxToCm(px, cmPerPx) / PRINT_CM_STEP) * PRINT_CM_STEP,
    toPx: (value) => cmToPx(value, cmPerPx),
    formatUnit: formatCm,
    formatPx: (px) => formatPxAsCm(px, cmPerPx),
    step: PRINT_CM_STEP,
  };
};

const resolveCmLimitPx = (cmValue: number | undefined, fallbackPx: number, cmPerPx: number | undefined): number =>
  cmPerPx !== undefined && cmValue !== undefined ? cmToPx(cmValue, cmPerPx) : fallbackPx;

export { cmToPx, createPrintUnit, DEFAULT_PRINT_REFERENCE_CM, formatCm, formatPxAsCm, pxToCm, resolveCmLimitPx, resolvePrintCmScale };
export type { printUnitType };
