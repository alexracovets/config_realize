'use client';

import { NAME_SLOT_COUNT } from '@configurator/constants';
import { useTextPrintMaskPipeline } from '@configurator/hooks/useGarmentTextPrintTextures/useTextPrintMaskPipeline';
import {
  applyGarmentNameMasks,
  applyGarmentNameStyle,
  applyGarmentNumberMasks,
  applyGarmentNumberStyle,
  applyGarmentTestoMasks,
  applyGarmentTestoStyle,
  buildNameStyleUniforms,
  buildNumberStyleUniforms,
  buildTestoStyleUniforms,
} from '@configurator/utils';
import {
  resolveInstancesForRender,
  resolveNumberInstancesForRender,
  resolveTestoInstancesForRender,
  useGarmentName,
  useGarmentNumber,
  useGarmentTesto,
} from '@store';
const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;

const useGarmentNameTextPrintTextures = () => {
  const productPath = useGarmentName((state) => state.productPath);
  const instances = useGarmentName((state) => state.instances);
  const preview = useGarmentName((state) => state.preview);
  const selectedInstanceId = useGarmentName((state) => state.selectedInstanceId);

  useTextPrintMaskPipeline({
    step: NAME_STEP,
    productPath,
    instances,
    preview,
    selectedInstanceId,
    resolveInstances: resolveInstancesForRender,
    applyMasks: applyGarmentNameMasks,
    applyStyle: applyGarmentNameStyle,
    buildStyleUniforms: buildNameStyleUniforms,
  });
};

const useGarmentNumberTextPrintTextures = () => {
  const productPath = useGarmentNumber((state) => state.productPath);
  const instances = useGarmentNumber((state) => state.instances);
  const preview = useGarmentNumber((state) => state.preview);
  const selectedInstanceId = useGarmentNumber((state) => state.selectedInstanceId);

  useTextPrintMaskPipeline({
    step: NUMBER_STEP,
    productPath,
    instances,
    preview,
    selectedInstanceId,
    resolveInstances: (items, itemPreview) => resolveNumberInstancesForRender(items, itemPreview).slice(0, NAME_SLOT_COUNT),
    applyMasks: applyGarmentNumberMasks,
    applyStyle: applyGarmentNumberStyle,
    buildStyleUniforms: buildNumberStyleUniforms,
  });
};

const useGarmentTestoTextPrintTextures = () => {
  const productPath = useGarmentTesto((state) => state.productPath);
  const instances = useGarmentTesto((state) => state.instances);
  const preview = useGarmentTesto((state) => state.preview);
  const selectedInstanceId = useGarmentTesto((state) => state.selectedInstanceId);

  useTextPrintMaskPipeline({
    step: TESTO_STEP,
    productPath,
    instances,
    preview,
    selectedInstanceId,
    resolveInstances: (items, itemPreview) => resolveTestoInstancesForRender(items, itemPreview).slice(0, NAME_SLOT_COUNT),
    applyMasks: applyGarmentTestoMasks,
    applyStyle: applyGarmentTestoStyle,
    buildStyleUniforms: buildTestoStyleUniforms,
  });
};

export { useGarmentNameTextPrintTextures, useGarmentNumberTextPrintTextures, useGarmentTestoTextPrintTextures };
