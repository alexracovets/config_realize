'use client';

import type { cartItemConfigurationType } from '@types';

const isNonemptyPrintText = (text: string) => text.trim().length > 0;

const extractUniqueTestoTexts = (configuration?: cartItemConfigurationType): string[] => {
  const instances = configuration?.testo?.instances ?? [];
  const seen = new Set<string>();
  const texts: string[] = [];

  for (const instance of instances) {
    const text = instance.text.trim();
    if (!isNonemptyPrintText(text) || seen.has(text)) continue;
    seen.add(text);
    texts.push(text);
  }

  return texts;
};

export { extractUniqueTestoTexts, isNonemptyPrintText };
