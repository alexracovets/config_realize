'use client';

import {
  ConfigurationColorize,
  ConfigurationDesign,
  ConfigurationLogo,
  ConfigurationNaming,
  ConfigurationNumbers,
  ConfigurationShading,
  ConfigurationTesto,
} from '@molecules';
import type { headerConfigItemType } from '@types';

const STEPS_CONFIGURATION: headerConfigItemType[] = [
  { value: 'colore', label: 'Color', content: ConfigurationColorize, step: 1 },
  { value: 'design', label: 'Design', content: ConfigurationDesign, step: 2 },
  { value: 'shading', label: 'Sfumatura', content: ConfigurationShading, step: 3 },
  { value: 'name', label: 'Nome', content: ConfigurationNaming, step: 4 },
  { value: 'number', label: 'Numero', content: ConfigurationNumbers, step: 5 },
  { value: 'testo', label: 'Testo', content: ConfigurationTesto, step: 6 },
  { value: 'logo', label: 'Logo', content: ConfigurationLogo, step: 7 },
];

export { STEPS_CONFIGURATION };
