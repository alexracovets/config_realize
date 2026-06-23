'use client';

import { CHECKOUT_DEFAULT_SIZE } from '@constants';
import type { cartItemConfigurationType, checkoutRowPresetType } from '@types';

import { sanitizeNumberText } from '../useGarmentNumber';

import { extractUniqueTestoTexts } from './extractUniqueTestoTexts';

const createCheckoutRow = (size: string, name = '', number = '', testoTexts: string[] = [], quantity = 1) => ({
  id: crypto.randomUUID(),
  size,
  name,
  number,
  testoTexts: [...testoTexts],
  quantity,
});

const extractCheckoutRowPreset = (configuration?: cartItemConfigurationType): checkoutRowPresetType => ({
  size: CHECKOUT_DEFAULT_SIZE,
  name: configuration?.name.instances[0]?.text ?? '',
  number: sanitizeNumberText(configuration?.number.instances[0]?.text ?? ''),
  testoTexts: extractUniqueTestoTexts(configuration),
});

const createCheckoutRowFromPreset = (preset: checkoutRowPresetType) => createCheckoutRow(preset.size, preset.name, preset.number, preset.testoTexts);

const buildCheckoutRows = (configuration?: cartItemConfigurationType) => [createCheckoutRowFromPreset(extractCheckoutRowPreset(configuration))];

export { buildCheckoutRows, createCheckoutRow, createCheckoutRowFromPreset, extractCheckoutRowPreset };
