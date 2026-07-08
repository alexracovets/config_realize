'use client';

import { cloneCartItemConfiguration } from '@store/useConfigurationCart/cartItemConfiguration';
import { isNonemptyPrintText } from '@store/useCheckout/extractUniqueTestoTexts';
import { sanitizeNumberText } from '@store/useGarmentNumber';
import type { cartItemConfigurationType, checkoutLineRowType, testoInstanceType } from '@types';

const resolveUniqueTestoSourceIndexes = (instances: testoInstanceType[]) => {
  const indexes: number[] = [];
  const seen = new Set<string>();

  instances.forEach((instance, index) => {
    const text = instance.text.trim();
    if (!isNonemptyPrintText(text) || seen.has(text)) return;

    seen.add(text);
    indexes.push(index);
  });

  return indexes;
};

const applyCheckoutTestoTextsToInstances = (instances: testoInstanceType[], checkoutTexts: string[]) => {
  const uniqueSourceIndexes = resolveUniqueTestoSourceIndexes(instances);

  return instances.map((instance, index) => {
    const sourceOrder = uniqueSourceIndexes.indexOf(index);
    if (sourceOrder === -1) return instance;

    return { ...instance, text: checkoutTexts[sourceOrder] ?? '' };
  });
};

const applyCheckoutFirstRowToConfiguration = (configuration: cartItemConfigurationType, row: Pick<checkoutLineRowType, 'name' | 'number' | 'testoTexts'>) => {
  const next = cloneCartItemConfiguration(configuration);

  if (next.name.instances.length > 0) {
    const targetIndex = next.name.instances.findIndex((instance) => instance.text.trim());
    const index = targetIndex >= 0 ? targetIndex : 0;
    next.name.instances[index] = { ...next.name.instances[index], text: row.name.trim() };
  }

  const numberText = sanitizeNumberText(row.number);
  next.number.instances = next.number.instances.map((instance) => ({ ...instance, text: numberText }));

  const testoInstances = next.testo?.instances ?? [];
  next.testo = {
    instances: applyCheckoutTestoTextsToInstances(testoInstances, row.testoTexts),
    selectedInstanceId: next.testo?.selectedInstanceId ?? null,
  };

  return next;
};

export { applyCheckoutFirstRowToConfiguration, applyCheckoutTestoTextsToInstances };
