'use client';

import { buildDefaultGradients, useGarmentColor } from '@store/useGarmentColor';
import { useGarmentDesign } from '@store/useGarmentDesign';
import { useGarmentLogo } from '@store/useGarmentLogo';
import { useGarmentName } from '@store/useGarmentName';
import { useGarmentNumber } from '@store/useGarmentNumber';
import { useGarmentTesto } from '@store/useGarmentTesto';
import type {
  cartItemConfigurationType,
  garmentColorSnapshotType,
  garmentConfigType,
  logoInstanceType,
  nameInstanceType,
  numberInstanceType,
  partGradientType,
  testoInstanceType,
  uvPointType,
} from '@types';
import { PALETTE_COLORS } from '@constants';
const DEFAULT_COLOR = PALETTE_COLORS[0];
const DEFAULT_OPACITY = 1;

const createDefaultColorSnapshot = (product: garmentConfigType): garmentColorSnapshotType => ({
  byPart: Object.fromEntries(product.parts.map((part) => [part.id, DEFAULT_COLOR])),
  gradientsByPart: buildDefaultGradients(product),
});

const cloneUvPoint = (uv: uvPointType): uvPointType => ({ ...uv });

const clonePartGradient = (gradient: partGradientType): partGradientType => ({ ...gradient });

const cloneNameInstance = (instance: nameInstanceType): nameInstanceType => ({
  ...instance,
  uv: cloneUvPoint(instance.uv),
});

const cloneNumberInstance = (instance: numberInstanceType): numberInstanceType => ({
  ...instance,
  uv: cloneUvPoint(instance.uv),
});

const cloneTestoInstance = (instance: testoInstanceType): testoInstanceType => ({
  ...instance,
  uv: cloneUvPoint(instance.uv),
});

const cloneLogoInstance = (instance: logoInstanceType): logoInstanceType => ({
  ...instance,
  uv: cloneUvPoint(instance.uv),
});

const cloneCartItemConfiguration = (configuration: cartItemConfigurationType): cartItemConfigurationType => ({
  color: {
    byPart: { ...configuration.color.byPart },
    gradientsByPart: Object.fromEntries(Object.entries(configuration.color.gradientsByPart).map(([partId, gradient]) => [partId, clonePartGradient(gradient)])),
  },
  design: {
    activePatternKey: configuration.design.activePatternKey,
    patternColors: { ...configuration.design.patternColors },
    designLayerColors: { ...configuration.design.designLayerColors },
    activeOpacity: configuration.design.activeOpacity,
    designOpacity: configuration.design.designOpacity,
  },
  name: {
    instances: configuration.name.instances.map(cloneNameInstance),
    selectedInstanceId: configuration.name.selectedInstanceId,
  },
  number: {
    instances: configuration.number.instances.map(cloneNumberInstance),
    selectedInstanceId: configuration.number.selectedInstanceId,
  },
  testo: {
    instances: (configuration.testo?.instances ?? []).map(cloneTestoInstance),
    selectedInstanceId: configuration.testo?.selectedInstanceId ?? null,
  },
  logo: {
    instances: configuration.logo.instances.map(cloneLogoInstance),
    selectedInstanceId: configuration.logo.selectedInstanceId,
  },
});

const createDefaultCartItemConfiguration = (product: garmentConfigType): cartItemConfigurationType => ({
  color: createDefaultColorSnapshot(product),
  design: {
    activePatternKey: null,
    patternColors: {},
    designLayerColors: {},
    activeOpacity: DEFAULT_OPACITY,
    designOpacity: DEFAULT_OPACITY,
  },
  name: {
    instances: [],
    selectedInstanceId: null,
  },
  number: {
    instances: [],
    selectedInstanceId: null,
  },
  testo: {
    instances: [],
    selectedInstanceId: null,
  },
  logo: {
    instances: [],
    selectedInstanceId: null,
  },
});

const captureGarmentConfiguration = (): cartItemConfigurationType => {
  const color = useGarmentColor.getState();
  const design = useGarmentDesign.getState();
  const name = useGarmentName.getState();
  const number = useGarmentNumber.getState();
  const testo = useGarmentTesto.getState();
  const logo = useGarmentLogo.getState();

  return cloneCartItemConfiguration({
    color: {
      byPart: color.byPart,
      gradientsByPart: color.gradientsByPart,
    },
    design: {
      activePatternKey: design.activePattern?.key ?? null,
      patternColors: design.patternColors,
      designLayerColors: design.designLayerColors,
      activeOpacity: design.activeOpacity,
      designOpacity: design.designOpacity,
    },
    name: {
      instances: name.instances,
      selectedInstanceId: name.selectedInstanceId,
    },
    number: {
      instances: number.instances,
      selectedInstanceId: number.selectedInstanceId,
    },
    testo: {
      instances: testo.instances,
      selectedInstanceId: testo.selectedInstanceId,
    },
    logo: {
      instances: logo.instances,
      selectedInstanceId: logo.selectedInstanceId,
    },
  });
};

const applyGarmentConfiguration = (product: garmentConfigType, configuration: cartItemConfigurationType | undefined) => {
  if (!configuration) {
    useGarmentColor.getState().initForProduct(product);
    useGarmentDesign.getState().initForProduct(product);
    useGarmentName.getState().initForProduct(product);
    useGarmentNumber.getState().initForProduct(product);
    useGarmentTesto.getState().initForProduct(product);
    useGarmentLogo.getState().initForProduct(product);
    return;
  }

  const snapshot = cloneCartItemConfiguration(configuration);

  useGarmentColor.getState().restoreSnapshot(snapshot.color);
  useGarmentDesign.getState().restoreSnapshot(product, snapshot.design);
  useGarmentName.getState().restoreSnapshot(product, snapshot.name);
  useGarmentNumber.getState().restoreSnapshot(product, snapshot.number);
  useGarmentTesto.getState().restoreSnapshot(product, snapshot.testo ?? { instances: [], selectedInstanceId: null });
  useGarmentLogo.getState().restoreSnapshot(product, snapshot.logo);
};

export { applyGarmentConfiguration, captureGarmentConfiguration, cloneCartItemConfiguration, createDefaultCartItemConfiguration, createDefaultColorSnapshot };
