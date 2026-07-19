import type { fontSizeLimitsType } from '@configurator/types';
import type { garmentConfigType, logoInstanceType, nameInstanceType, numberInstanceType, testoInstanceType } from '@types';

interface buildLogoGizmoElementsInputType {
  product: garmentConfigType;
  instances: logoInstanceType[];
}

interface buildNameGizmoElementsInputType {
  product: garmentConfigType;
  instances: nameInstanceType[];
  resolveFontSizeLimits: (instance: nameInstanceType) => fontSizeLimitsType;
}

interface buildNumberGizmoElementsInputType {
  product: garmentConfigType;
  instances: numberInstanceType[];
  resolveFontSizeLimits: (instance: numberInstanceType) => fontSizeLimitsType;
}

interface buildTestoGizmoElementsInputType {
  product: garmentConfigType;
  instances: testoInstanceType[];
  resolveFontSizeLimits: (instance: testoInstanceType) => fontSizeLimitsType;
}

export type { buildLogoGizmoElementsInputType, buildNameGizmoElementsInputType, buildNumberGizmoElementsInputType, buildTestoGizmoElementsInputType };
