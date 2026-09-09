'use client';

import type { cartItemConfigurationType } from '@types';

const buildConfigurationSignature = (configuration: cartItemConfigurationType): string =>
  JSON.stringify([
    configuration.color,
    configuration.design,
    configuration.name.instances,
    configuration.number.instances,
    configuration.testo?.instances ?? [],
    configuration.logo.instances,
  ]);

export { buildConfigurationSignature };
