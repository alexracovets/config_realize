import type { garmentConfigType, logoInstanceType, nameInstanceType, numberInstanceType, testoInstanceType } from '@types';

interface buildLogoGizmoElementsInputType {
  product: garmentConfigType;
  instances: logoInstanceType[];
}

interface buildNameGizmoElementsInputType {
  product: garmentConfigType;
  instances: nameInstanceType[];
  fontSizeMin: number;
  fontSizeMax: number;
}

interface buildNumberGizmoElementsInputType {
  product: garmentConfigType;
  instances: numberInstanceType[];
  fontSizeMin: number;
  fontSizeMax: number;
}

interface buildTestoGizmoElementsInputType {
  product: garmentConfigType;
  instances: testoInstanceType[];
  fontSizeMin: number;
  fontSizeMax: number;
}

export type { buildLogoGizmoElementsInputType, buildNameGizmoElementsInputType, buildNumberGizmoElementsInputType, buildTestoGizmoElementsInputType };
