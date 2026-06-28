'use client';

import { ConfigurationColorize } from '@molecules/ConfigurationSteps/ConfigurationColorize';
import { ConfigurationDesign } from '@molecules/ConfigurationSteps/ConfigurationDesign';
import { ConfigurationLogo } from '@molecules/ConfigurationSteps/ConfigurationLogo';
import { ConfigurationNaming } from '@molecules/ConfigurationSteps/ConfigurationNaming';
import { ConfigurationNumbers } from '@molecules/ConfigurationSteps/ConfigurationNumbers';
import { ConfigurationShading } from '@molecules/ConfigurationSteps/ConfigurationShading';
import { ConfigurationTesto } from '@molecules/ConfigurationSteps/ConfigurationTesto';
import type { configuratorStepValueType } from '@configurator/types';
import type { headerConfigItemType } from '@types';
import { CONFIGURATOR_STEP_META } from '@constants';
const CONFIGURATION_STEP_CONTENT: Record<configuratorStepValueType, headerConfigItemType['content']> = {
  colore: ConfigurationColorize,
  design: ConfigurationDesign,
  shading: ConfigurationShading,
  name: ConfigurationNaming,
  number: ConfigurationNumbers,
  testo: ConfigurationTesto,
  logo: ConfigurationLogo,
};

const STEPS_CONFIGURATION: headerConfigItemType[] = CONFIGURATOR_STEP_META.map((step) => ({
  ...step,
  content: CONFIGURATION_STEP_CONTENT[step.value],
}));

export { STEPS_CONFIGURATION };
