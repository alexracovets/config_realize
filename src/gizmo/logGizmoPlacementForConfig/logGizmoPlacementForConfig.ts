import type { garmentConfigType, printGizmoElementKindType, uvPointType } from '@types';
import { resolvePartUvBounds, resolveProductGizmoRotation } from '@utils';

const round = (value: number, digits = 3) => Number(value.toFixed(digits));

const roundUv = (uv: uvPointType, digits = 3): uvPointType => ({
  x: round(uv.x, digits),
  y: round(uv.y, digits),
});

const resolveZoneFromPartId = (partId: string) => {
  const lower = partId.toLowerCase();
  if (lower.includes('front')) return 'front';
  if (lower.includes('back')) return 'back';
  if (lower.includes('left')) return 'left';
  if (lower.includes('right')) return 'right';
  return partId;
};

const atlasUvToZoneLocalUv = (product: garmentConfigType, partId: string, atlasUv: uvPointType): uvPointType => {
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

const logGizmoPlacementForConfig = ({ kind, label, partId, uv, product, rotation = 0, fontSize, scale, phase = 'release' }: LogGizmoPlacementInput) => {
  const atlasUv = roundUv(uv);
  const phaseLabel = phase === 'drag' ? ' (drag)' : ' (release)';
  const rotationRounded = round(rotation, 1);
  const productGizmoRotation = resolveProductGizmoRotation(product);

  if (kind === 'number') {
    const zone = resolveZoneFromPartId(partId);
    const localUv = atlasUvToZoneLocalUv(product, partId, uv);
    const snippet = {
      label,
      zone,
      uv: localUv,
      rotation: rotationRounded,
      ...(fontSize !== undefined ? { fontSize: Math.round(fontSize) } : {}),
    };

    console.log(`[gizmo]${phaseLabel} ${label} — numberPositions:\n${JSON.stringify(snippet, null, 2)}`);
    console.log(`[gizmo]${phaseLabel} ${label} — atlas uv:`, atlasUv, 'partId:', partId, 'gizmoRotation:', productGizmoRotation);
    return;
  }

  if (kind === 'name' || kind === 'testo') {
    const positionsKey = kind === 'testo' ? 'testoPositions' : 'namePositions';
    const snippet = {
      label,
      partId,
      uv: atlasUv,
      rotation: rotationRounded,
      ...(fontSize !== undefined ? { fontSize: Math.round(fontSize) } : {}),
    };

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
