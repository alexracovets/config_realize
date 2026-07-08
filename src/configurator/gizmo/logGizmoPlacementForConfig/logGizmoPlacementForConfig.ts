import type { printGizmoElementKindType } from '@configurator/types';
import type { garmentConfigType, uvPointType } from '@types';
import { resolvePartUvBounds } from '@configurator/mappers';

const round = (value: number, digits = 3) => Number(value.toFixed(digits));

const roundUv = (uv: uvPointType, digits = 3): uvPointType => ({
  x: round(uv.x, digits),
  y: round(uv.y, digits),
});

const atlasUvToPartLocalUv = (product: garmentConfigType, partId: string, atlasUv: uvPointType): uvPointType => {
  const part = product.parts.find((item) => item.id === partId);
  if (!part) return roundUv(atlasUv);

  const bounds = resolvePartUvBounds(part);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  return roundUv({
    x: width > 0 ? (atlasUv.x - bounds.minX) / width : atlasUv.x,
    y: height > 0 ? (atlasUv.y - bounds.minY) / height : atlasUv.y,
  });
};

interface LogGizmoPlacementInput {
  kind: printGizmoElementKindType;
  label: string;
  partId: string;
  uv: uvPointType;
  product: garmentConfigType;
  rotation?: number;
  fontSize?: number;
  scale?: number;
  phase?: 'drag' | 'release';
}

const buildTextPositionSnippet = (
  product: garmentConfigType,
  partId: string,
  label: string,
  atlasUv: uvPointType,
  rotation: number,
  fontSize?: number,
) => ({
  label,
  partId,
  uv: atlasUvToPartLocalUv(product, partId, atlasUv),
  rotation: round(rotation, 1),
  ...(fontSize !== undefined ? { fontSize: Math.round(fontSize) } : {}),
});

const logGizmoPlacementForConfig = ({ kind, label, partId, uv, product, rotation = 0, fontSize, scale, phase = 'release' }: LogGizmoPlacementInput) => {
  const atlasUv = roundUv(uv);
  const phaseLabel = phase === 'drag' ? ' (drag)' : ' (release)';
  const rotationRounded = round(rotation, 1);

  if (kind === 'number') {
    const snippet = buildTextPositionSnippet(product, partId, label, uv, rotation, fontSize);

    console.log(`[gizmo]${phaseLabel} ${label} — numberPositions:\n${JSON.stringify(snippet, null, 2)}`);
    return;
  }

  if (kind === 'name' || kind === 'testo') {
    const positionsKey = kind === 'testo' ? 'testoPositions' : 'namePositions';
    const snippet = buildTextPositionSnippet(product, partId, label, uv, rotation, fontSize);

    console.log(`[gizmo]${phaseLabel} ${label} — ${positionsKey}:\n${JSON.stringify(snippet, null, 2)}`);
    return;
  }

  const snippet = {
    label,
    partId,
    uv: atlasUv,
    rotation: rotationRounded,
    ...(scale !== undefined ? { scale: round(scale, 3) } : {}),
  };

  console.log(`[gizmo]${phaseLabel} ${label} — logoPositions:\n${JSON.stringify(snippet, null, 2)}`);
};

export { logGizmoPlacementForConfig };
