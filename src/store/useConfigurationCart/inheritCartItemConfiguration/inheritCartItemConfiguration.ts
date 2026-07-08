'use client';

import type { cartItemConfigurationType, garmentColorSnapshotType, garmentConfigType, nameInstanceType, numberInstanceType, testoInstanceType } from '@types';
import { PALETTE_COLORS } from '@constants';
import { createDefaultCartItemConfiguration, createDefaultColorSnapshot } from '@store/useConfigurationCart/cartItemConfiguration';
import { inheritLogoSnapshot } from '@store/useConfigurationCart/inheritCartItemConfiguration/inheritLogoSnapshot';
import { inheritTextPrintSnapshot } from '@store/useConfigurationCart/inheritCartItemConfiguration/inheritTextPrintSnapshot';
import { createNameInstance, mapProductNamePositions } from '@store/useGarmentName';
import { createNumberInstance, mapProductNumberPositions, sanitizeNumberText } from '@store/useGarmentNumber';
import { createTestoInstance, mapProductTestoPositions } from '@store/useGarmentTesto';
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

const inheritDesignSnapshot = (reference: cartItemConfigurationType['design']): cartItemConfigurationType['design'] => ({
  activePatternKey: reference.activePatternKey,
  patternColors: { ...reference.patternColors },
  designLayerColors: { ...reference.designLayerColors },
  activeOpacity: reference.activeOpacity,
  designOpacity: reference.designOpacity,
});

const mergeNameContent = (created: nameInstanceType, reference: nameInstanceType): nameInstanceType => ({
  ...created,
  text: reference.text,
  font: reference.font,
  textColor: reference.textColor,
  strokeColor: reference.strokeColor,
  strokeWidth: reference.strokeWidth,
  fontSize: reference.fontSize,
});

const mergeNumberContent = (created: numberInstanceType, reference: numberInstanceType): numberInstanceType => ({
  ...created,
  text: sanitizeNumberText(reference.text),
  font: reference.font,
  textColor: reference.textColor,
  strokeColor: reference.strokeColor,
  strokeWidth: reference.strokeWidth,
  fontSize: reference.fontSize,
  lineHeight: reference.lineHeight,
});

const mergeTestoContent = (created: testoInstanceType, reference: testoInstanceType): testoInstanceType => ({
  ...created,
  text: reference.text,
  font: reference.font,
  textColor: reference.textColor,
  strokeColor: reference.strokeColor,
  strokeWidth: reference.strokeWidth,
  fontSize: reference.fontSize,
  lineHeight: reference.lineHeight,
  letterSpacing: reference.letterSpacing,
});

const inheritPrintSnapshots = (
  referenceConfiguration: cartItemConfigurationType,
  newProduct: garmentConfigType,
): Pick<cartItemConfigurationType, 'name' | 'number' | 'testo' | 'logo'> => ({
  name: inheritTextPrintSnapshot(referenceConfiguration.name, newProduct, mapProductNamePositions, createNameInstance, mergeNameContent),
  number: inheritTextPrintSnapshot(referenceConfiguration.number, newProduct, mapProductNumberPositions, createNumberInstance, mergeNumberContent),
  testo: inheritTextPrintSnapshot(referenceConfiguration.testo, newProduct, mapProductTestoPositions, createTestoInstance, mergeTestoContent),
  logo: inheritLogoSnapshot(referenceConfiguration.logo, newProduct),
});

const inheritCartItemConfiguration = (
  referenceConfiguration: cartItemConfigurationType,
  referenceProduct: garmentConfigType,
  newProduct: garmentConfigType,
): cartItemConfigurationType => {
  const defaults = createDefaultCartItemConfiguration(newProduct);
  const sameGarmentType = referenceProduct.type === newProduct.type;
  const sameGarmentFamily = sameGarmentType && (newProduct.type === SHIRT_TYPE || newProduct.type === SHORTS_TYPE);

  const color = sameGarmentFamily
    ? copyColorSnapshotForProduct(referenceConfiguration.color, newProduct)
    : applySingleReferenceColor(referenceConfiguration.color, referenceProduct, newProduct);

  return {
    ...defaults,
    color,
    design: inheritDesignSnapshot(referenceConfiguration.design),
    ...(sameGarmentType ? inheritPrintSnapshots(referenceConfiguration, newProduct) : {}),
  };
};

export { inheritCartItemConfiguration };
