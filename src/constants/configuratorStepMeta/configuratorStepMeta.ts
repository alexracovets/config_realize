import type { configuratorStepValueType } from '@types';

type configuratorStepMetaItemType = {
  value: configuratorStepValueType;
  label: string;
  step: number;
};

const CONFIGURATOR_STEP_META: configuratorStepMetaItemType[] = [
  { value: 'colore', label: 'Color', step: 1 },
  { value: 'design', label: 'Design', step: 2 },
  { value: 'shading', label: 'Sfumatura', step: 3 },
  { value: 'name', label: 'Nome', step: 4 },
  { value: 'number', label: 'Numero', step: 5 },
  { value: 'testo', label: 'Testo', step: 6 },
  { value: 'logo', label: 'Logo', step: 7 },
];

export { CONFIGURATOR_STEP_META };
export type { configuratorStepMetaItemType };
