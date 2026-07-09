import type { garmentConfigType, garmentPartConfigType, printReferenceCmType } from '@types';

/** Centimetres-per-pixel conversion factors for the print atlas, derived per axis. */
interface printCmScaleType {
  /** Horizontal cm per atlas pixel (width axis). */
  cmPerPxX: number;
  /** Vertical cm per atlas pixel (height axis). */
  cmPerPxY: number;
}

const uvArea = (part: garmentPartConfigType): number => {
  const bounds = part.uvBounds;
  if (!bounds) return 0;
  return Math.max(0, bounds.maxX - bounds.minX) * Math.max(0, bounds.maxY - bounds.minY);
};

/** Picks the largest UV panel — the main body panel whose real size matches the L-size measurements. */
const resolvePrimaryPart = (parts: garmentPartConfigType[]): garmentPartConfigType | null => {
  const withBounds = parts.filter((part) => part.uvBounds);
  if (withBounds.length === 0) return null;
  return withBounds.reduce((largest, part) => (uvArea(part) > uvArea(largest) ? part : largest));
};

/**
 * Computes the cm-per-pixel factors that map print-atlas pixels to real-world centimetres,
 * using the product's primary UV panel extent and the L-size garment measurements.
 * Returns `null` when the atlas, panel, or reference measurements are unavailable — callers
 * then keep displaying pixels.
 */
const resolvePrintCmScale = (product: garmentConfigType, reference?: printReferenceCmType | null): printCmScaleType | null => {
  const atlas = product.printAtlas;
  if (!atlas || !reference) return null;

  const part = resolvePrimaryPart(product.parts);
  if (!part?.uvBounds) return null;

  const panelWidthPx = (part.uvBounds.maxX - part.uvBounds.minX) * atlas.width;
  const panelHeightPx = (part.uvBounds.maxY - part.uvBounds.minY) * atlas.height;
  if (panelWidthPx <= 0 || panelHeightPx <= 0) return null;

  return {
    cmPerPxX: reference.widthCm / panelWidthPx,
    cmPerPxY: reference.heightCm / panelHeightPx,
  };
};

/** Formats a pixel value as a centimetre string (e.g. `3.2 cm`) using the given cm-per-pixel factor. */
const formatPxAsCm = (px: number, cmPerPx: number): string => `${(px * cmPerPx).toFixed(1)} cm`;

export { formatPxAsCm, resolvePrintCmScale };
export type { printCmScaleType };
