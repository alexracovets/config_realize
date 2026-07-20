import type { printPositionRelationConfigType, uvPointType } from '@types';

type atlasSizeType = { width: number; height: number };
type halfSizeType = { x: number; y: number };

type resolvePrintRelationUvInputType = {
  leaderUv: uvPointType;
  leaderHalf: halfSizeType;
  leaderScale: number;
  followerHalf: halfSizeType;
  followerScale: number;
  relation: Pick<printPositionRelationConfigType, 'x' | 'y'>;
  contentRotationDeg: number;
  partRotationDeg: number;
  atlasSize: atlasSizeType;
};

const rotateLocalPx = (x: number, y: number, rotationDeg: number) => {
  const rad = (-rotationDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  return { x: cosA * x - sinA * y, y: sinA * x + cosA * y };
};

const resolveRelationAxis = (axis: 'left' | 'center' | 'right' | 'top' | 'bottom', negative: number, positive: number) => {
  if (axis === 'left' || axis === 'bottom') return negative;
  if (axis === 'right' || axis === 'top') return positive;
  return 0;
};

/** Place follower outside the leader frame edge described by relation x/y (content space). */
const resolvePrintRelationUv = ({
  leaderUv,
  leaderHalf,
  leaderScale,
  followerHalf,
  followerScale,
  relation,
  contentRotationDeg,
  partRotationDeg,
  atlasSize,
}: resolvePrintRelationUvInputType): uvPointType => {
  const nx = resolveRelationAxis(relation.x, -1, 1);
  const ny = resolveRelationAxis(relation.y, -1, 1);

  const content = {
    x: nx * (leaderHalf.x * leaderScale + followerHalf.x * followerScale),
    y: ny * (leaderHalf.y * leaderScale + followerHalf.y * followerScale),
  };
  const local = rotateLocalPx(content.x, content.y, contentRotationDeg);
  const delta = rotateLocalPx(local.x, local.y, -partRotationDeg);

  return {
    x: leaderUv.x + delta.x / atlasSize.width,
    y: leaderUv.y + delta.y / atlasSize.height,
  };
};

export { resolvePrintRelationUv };
export type { resolvePrintRelationUvInputType };
