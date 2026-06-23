'use client';

import type { cartItemConfigurationType } from '@types';

const extractUniqueTestoTexts = (configuration?: cartItemConfigurationType): string[] => {
  const instances = configuration?.testo?.instances ?? [];
  const seen = new Set<string>();
  const texts: string[] = [];

  for (const instance of instances) {
    if (seen.has(instance.text)) continue;
    seen.add(instance.text);
    texts.push(instance.text);
  }

  return texts;
};

export { extractUniqueTestoTexts };
