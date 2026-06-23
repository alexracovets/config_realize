import type { partGradientConfigType } from '@types';

type partGradientType = {
  enabled: boolean;
  color2: string;
} & partGradientConfigType;

export type { partGradientType };
