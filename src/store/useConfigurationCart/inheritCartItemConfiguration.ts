'use client';

import type { cartItemConfigurationType, garmentColorSnapshotType, garmentConfigType } from '@types';
import { PALETTE_COLORS } from '../../constants/PALETTE_COLORS/PALETTE_COLORS';
import { createDefaultCartItemConfiguration, createDefaultColorSnapshot } from './cartItemConfiguration';

const DEFAULT_COLOR = PALETTE_COLORS[0];
const SHIRT_TYPE = 'shirt';
const SHORTS_TYPE = 'shorts';

const resolveReferenceColorPartId = (product: garmentConfigType): string | null => {
  if (product.type === SHIRT_TYPE) {
    return product.parts.find((part) => part.label === 'Front')?.id ?? product.parts[0]?.id ?? null;
  }

  if (product.type === SHORTS_TYPE) {
    return product.parts.find((part) => part.label === 'Right')?.id ?? product.parts[0]?.id ?? null;
  }

  return product.parts[0]?.id ?? null;
};

const copyColorSnapshotForProduct = (reference: garmentColorSnapshotType, newProduct: garmentConfigType): garmentColorSnapshotType => {
  const defaults = createDefaultColorSnapshot(newProduct);
  const byPart = { ...defaults.byPart };
  const gradientsByPart = { ...defaults.gradientsByPart };

  for (const part of newProduct.parts) {
    const referenceColor = reference.byPart[part.id];
    if (referenceColor !== undefined) {
      byPart[part.id] = referenceColor;
    }

    const referenceGradient = reference.gradientsByPart[part.id];
    if (!part.colorOnly && referenceGradient !== undefined) {
      gradientsByPart[part.id] = { ...referenceGradient };
    }
  }

  return { byPart, gradientsByPart };
};

const applySingleReferenceColor = (
  reference: garmentColorSnapshotType,
  referenceProduct: garmentConfigType,
  newProduct: garmentConfigType,
): garmentColorSnapshotType => {
  const sourcePartId = resolveReferenceColorPartId(referenceProduct);
  const sourceColor = sourcePartId ? (reference.byPart[sourcePartId] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
  const defaults = createDefaultColorSnapshot(newProduct);

  return {
    byPart: Object.fromEntries(newProduct.parts.map((part) => [part.id, sourceColor])),
    gradientsByPart: defaults.gradientsByPart,
  };
};

const inheritCartItemConfiguration = (
  referenceConfiguration: cartItemConfigurationType,
  referenceProduct: garmentConfigType,
  newProduct: garmentConfigType,
): cartItemConfigurationType => {
  const defaults = createDefaultCartItemConfiguration(newProduct);
  const sameGarmentFamily = referenceProduct.type === newProduct.type && (newProduct.type === SHIRT_TYPE || newProduct.type === SHORTS_TYPE);

  const color = sameGarmentFamily
    ? copyColorSnapshotForProduct(referenceConfiguration.color, newProduct)
    : applySingleReferenceColor(referenceConfiguration.color, referenceProduct, newProduct);

  return {
    ...defaults,
    color,
  };
};

export { inheritCartItemConfiguration };
