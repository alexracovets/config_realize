import type { nameInstanceType, testoInstanceType } from '@types';
import { NAME_REFERENCE_FONT_SIZE } from '@configurator/constants';
import { measureNameGizmoHalf, resolvePartPrintRotation, resolvePrintRelationUv, resolveTextContentRotationDeg, resolveTextGizmoMeasureOptions } from '@configurator/utils';
import { useConfiguratorProduct, useGarmentName, useGarmentTesto } from '@store';

type printRelationE2eInstanceType = {
  id: string;
  positionId: string | null;
  uv: { x: number; y: number };
  fontSize: number;
  text: string;
  partId: string;
};

type printRelationE2ePairType = {
  name: printRelationE2eInstanceType;
  testo: printRelationE2eInstanceType;
  expectedTestoUv: { x: number; y: number };
  error: number;
};

declare global {
  interface Window {
    __printRelationE2e?: {
      getTopBackPair: () => printRelationE2ePairType | null;
      setNameFontSize: (fontSize: number) => boolean;
      setTestoFontSize: (fontSize: number) => boolean;
      previewNameFontSize: (fontSize: number) => boolean;
      previewTestoFontSize: (fontSize: number) => boolean;
    };
  }
}

const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measureCtx = measureCanvas?.getContext('2d') ?? null;

const mapInstance = (
  instance: nameInstanceType | testoInstanceType,
  positions: { key: string; positionId?: string }[],
): printRelationE2eInstanceType => ({
  id: instance.id,
  positionId: positions.find((position) => position.key === instance.positionKey)?.positionId ?? null,
  uv: { ...instance.uv },
  fontSize: instance.fontSize,
  text: instance.text,
  partId: instance.partId,
});

const resolveHalf = (instance: nameInstanceType | testoInstanceType) => {
  if (!measureCtx || !instance.text.trim()) return null;
  return measureNameGizmoHalf(instance.text, instance.font, measureCtx, resolveTextGizmoMeasureOptions(instance));
};

const getTopBackPair = (): printRelationE2ePairType | null => {
  const product = useConfiguratorProduct.getState().product;
  const nameState = useGarmentName.getState();
  const testoState = useGarmentTesto.getState();

  const nameInstance = nameState.getInstancesForRender().find((instance) => {
    const position = nameState.positions.find((item) => item.key === instance.positionKey);
    return position?.positionId === 'top_back';
  });
  const testoInstance = testoState.getInstancesForRender().find((instance) => {
    const position = testoState.positions.find((item) => item.key === instance.positionKey);
    return position?.positionId === 'top_back';
  });
  if (!nameInstance || !testoInstance) return null;

  const testoPosition = testoState.positions.find((item) => item.key === testoInstance.positionKey);
  const relation = testoPosition?.relation;
  if (!relation) return null;

  const leaderHalf = resolveHalf(nameInstance);
  const followerHalf = resolveHalf(testoInstance);
  if (!leaderHalf || !followerHalf) return null;

  const part = product.parts.find((item) => item.id === nameInstance.partId);
  const expectedTestoUv = resolvePrintRelationUv({
    leaderUv: nameInstance.uv,
    leaderHalf,
    leaderScale: nameInstance.fontSize / NAME_REFERENCE_FONT_SIZE,
    followerHalf,
    followerScale: testoInstance.fontSize / NAME_REFERENCE_FONT_SIZE,
    relation,
    contentRotationDeg: resolveTextContentRotationDeg(nameInstance),
    partRotationDeg: part ? resolvePartPrintRotation(part) : 0,
    atlasSize: {
      width: product.printAtlas?.width ?? 2048,
      height: product.printAtlas?.height ?? 2048,
    },
  });

  const error = Math.hypot(testoInstance.uv.x - expectedTestoUv.x, testoInstance.uv.y - expectedTestoUv.y);

  return {
    name: mapInstance(nameInstance, nameState.positions),
    testo: mapInstance(testoInstance, testoState.positions),
    expectedTestoUv,
    error,
  };
};

const setNameFontSize = (fontSize: number) => {
  const nameState = useGarmentName.getState();
  const nameInstance = nameState.instances.find((instance) => {
    const position = nameState.positions.find((item) => item.key === instance.positionKey);
    return position?.positionId === 'top_back';
  });
  if (!nameInstance) return false;

  nameState.updateInstance(nameInstance.id, { fontSize });
  return true;
};

const setTestoFontSize = (fontSize: number) => {
  const testoState = useGarmentTesto.getState();
  const testoInstance = testoState.instances.find((instance) => {
    const position = testoState.positions.find((item) => item.key === instance.positionKey);
    return position?.positionId === 'top_back';
  });
  if (!testoInstance) return false;

  testoState.updateInstance(testoInstance.id, { fontSize });
  return true;
};

const previewNameFontSize = (fontSize: number) => {
  const nameState = useGarmentName.getState();
  const nameInstance = nameState.instances.find((instance) => {
    const position = nameState.positions.find((item) => item.key === instance.positionKey);
    return position?.positionId === 'top_back';
  });
  if (!nameInstance) return false;

  nameState.setPreview(nameInstance.id, { fontSize });
  return true;
};

const previewTestoFontSize = (fontSize: number) => {
  const testoState = useGarmentTesto.getState();
  const testoInstance = testoState.instances.find((instance) => {
    const position = testoState.positions.find((item) => item.key === instance.positionKey);
    return position?.positionId === 'top_back';
  });
  if (!testoInstance) return false;

  testoState.setPreview(testoInstance.id, { fontSize });
  return true;
};

const registerPrintRelationE2eDebug = () => {
  if (process.env.NODE_ENV === 'production') {
    return () => undefined;
  }

  window.__printRelationE2e = {
    getTopBackPair,
    setNameFontSize,
    setTestoFontSize,
    previewNameFontSize,
    previewTestoFontSize,
  };

  return () => {
    delete window.__printRelationE2e;
  };
};

export { registerPrintRelationE2eDebug };
