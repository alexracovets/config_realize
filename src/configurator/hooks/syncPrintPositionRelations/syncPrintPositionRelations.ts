import type {
  garmentConfigType,
  garmentTextRenderInstanceType,
  nameInstanceType,
  numberInstanceType,
  printPositionRelationConfigType,
  testoInstanceType,
  textPrintPositionType,
} from '@types';
import { NAME_REFERENCE_FONT_SIZE } from '@configurator/constants';
import { measureNameGizmoHalf, resolvePartPrintRotation, resolvePrintRelationUv, resolveTextContentRotationDeg, resolveTextGizmoMeasureOptions } from '@configurator/utils';
import { useConfiguratorProduct, useGarmentName, useGarmentNumber, useGarmentTesto } from '@store';

type printRelationKindType = 'name' | 'number' | 'testo';

type printRelationBucketType = {
  kind: printRelationKindType;
  positions: textPrintPositionType[];
  instances: garmentTextRenderInstanceType[];
  write: (id: string, patch: { uv: { x: number; y: number }; partId: string }) => void;
};

const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const measureCtx = measureCanvas?.getContext('2d') ?? null;

const resolveInstanceHalf = (instance: garmentTextRenderInstanceType) => {
  if (!measureCtx || !instance.text.trim()) return null;
  return measureNameGizmoHalf(instance.text, instance.font, measureCtx, resolveTextGizmoMeasureOptions(instance));
};

const resolveAtlasSize = (product: garmentConfigType) => ({
  width: product.printAtlas?.width ?? 2048,
  height: product.printAtlas?.height ?? 2048,
});

const resolvePartRotationDeg = (product: garmentConfigType, partId: string) => {
  const part = product.parts.find((item) => item.id === partId);
  return part ? resolvePartPrintRotation(part) : 0;
};

const readRelationItems = (relation: printPositionRelationConfigType | undefined, kind: printRelationKindType) => relation?.items?.[kind] ?? [];

const collectBuckets = (): printRelationBucketType[] => [
  {
    kind: 'name',
    positions: useGarmentName.getState().positions,
    instances: useGarmentName.getState().instances,
    write: (id, patch) => useGarmentName.getState().updateInstance(id, patch),
  },
  {
    kind: 'number',
    positions: useGarmentNumber.getState().positions,
    instances: useGarmentNumber.getState().instances,
    write: (id, patch) => useGarmentNumber.getState().updateInstance(id, patch),
  },
  {
    kind: 'testo',
    positions: useGarmentTesto.getState().positions,
    instances: useGarmentTesto.getState().instances,
    write: (id, patch) => useGarmentTesto.getState().updateInstance(id, patch),
  },
];

const collectPreviewBuckets = (): printRelationBucketType[] => [
  {
    kind: 'name',
    positions: useGarmentName.getState().positions,
    instances: useGarmentName.getState().getInstancesForRender(),
    write: (id, patch) => useGarmentName.getState().setPreview(id, patch),
  },
  {
    kind: 'number',
    positions: useGarmentNumber.getState().positions,
    instances: useGarmentNumber.getState().getInstancesForRender(),
    write: (id, patch) => useGarmentNumber.getState().setPreview(id, patch),
  },
  {
    kind: 'testo',
    positions: useGarmentTesto.getState().positions,
    instances: useGarmentTesto.getState().getInstancesForRender(),
    write: (id, patch) => useGarmentTesto.getState().setPreview(id, patch),
  },
];

const findPosition = (positions: textPrintPositionType[], positionKey: string) => positions.find((position) => position.key === positionKey);

const findLeaderInstance = (buckets: printRelationBucketType[], kind: printRelationKindType, positionId: string) => {
  const bucket = buckets.find((item) => item.kind === kind);
  if (!bucket) return null;

  for (const instance of bucket.instances) {
    const position = findPosition(bucket.positions, instance.positionKey);
    if (position?.positionId === positionId) return { instance, position };
  }

  return null;
};

const snapFollowerToLeader = (
  product: garmentConfigType,
  follower: garmentTextRenderInstanceType,
  relation: printPositionRelationConfigType,
  leader: garmentTextRenderInstanceType,
  writeFollower: printRelationBucketType['write'],
) => {
  const leaderHalf = resolveInstanceHalf(leader);
  const followerHalf = resolveInstanceHalf(follower);
  if (!leaderHalf || !followerHalf) return;

  const uv = resolvePrintRelationUv({
    leaderUv: leader.uv,
    leaderHalf,
    leaderScale: leader.fontSize / NAME_REFERENCE_FONT_SIZE,
    followerHalf,
    followerScale: follower.fontSize / NAME_REFERENCE_FONT_SIZE,
    relation,
    contentRotationDeg: resolveTextContentRotationDeg(leader),
    partRotationDeg: resolvePartRotationDeg(product, leader.partId),
    atlasSize: resolveAtlasSize(product),
  });

  writeFollower(follower.id, { uv, partId: leader.partId });
};

const runSyncPass = (buckets: printRelationBucketType[], options: { leaderKind?: printRelationKindType; leaderInstanceId?: string; followerInstanceId?: string }) => {
  const product = useConfiguratorProduct.getState().product;

  for (const followerBucket of buckets) {
    for (const follower of followerBucket.instances) {
      if (options.followerInstanceId && follower.id !== options.followerInstanceId) continue;

      const followerPosition = findPosition(followerBucket.positions, follower.positionKey);
      const relation = followerPosition?.relation;
      if (!relation) continue;

      for (const leaderKind of ['name', 'number', 'testo'] as const) {
        for (const leaderPositionId of readRelationItems(relation, leaderKind)) {
          const leaderMatch = findLeaderInstance(buckets, leaderKind, leaderPositionId);
          if (!leaderMatch) continue;

          if (options.leaderKind && options.leaderKind !== leaderKind) continue;
          if (options.leaderInstanceId && leaderMatch.instance.id !== options.leaderInstanceId) continue;

          snapFollowerToLeader(product, follower, relation, leaderMatch.instance, followerBucket.write);
        }
      }
    }
  }
};

const syncPrintPositionRelations = (options?: { leaderKind?: printRelationKindType; leaderInstanceId?: string; followerInstanceId?: string }) => {
  runSyncPass(collectBuckets(), options ?? {});
};

const syncPrintPositionRelationsForLeader = (leaderKind: printRelationKindType, leaderInstance: nameInstanceType | numberInstanceType | testoInstanceType) => {
  syncPrintPositionRelations({ leaderKind, leaderInstanceId: leaderInstance.id });
};

const syncPrintPositionRelationsForFollower = (followerInstanceId: string) => {
  syncPrintPositionRelations({ followerInstanceId });
};

const syncPrintPositionRelationsPreviewForLeader = (leaderKind: printRelationKindType, leaderInstanceId: string) => {
  runSyncPass(collectPreviewBuckets(), { leaderKind, leaderInstanceId });
};

const syncPrintPositionRelationsPreviewForFollower = (followerInstanceId: string) => {
  runSyncPass(collectPreviewBuckets(), { followerInstanceId });
};

export {
  syncPrintPositionRelations,
  syncPrintPositionRelationsForFollower,
  syncPrintPositionRelationsForLeader,
  syncPrintPositionRelationsPreviewForFollower,
  syncPrintPositionRelationsPreviewForLeader,
};
