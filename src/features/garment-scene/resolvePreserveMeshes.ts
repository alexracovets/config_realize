import type { preserveGltfMeshConfigType } from '@types';

type resolvedPreserveGltfMeshType = {
  meshName: string;
  renderOrder: number;
};

const resolvePreserveMeshes = (entries: preserveGltfMeshConfigType[] | undefined): resolvedPreserveGltfMeshType[] =>
  (entries ?? []).map((entry) =>
    typeof entry === 'string' ? { meshName: entry, renderOrder: 0 } : { meshName: entry.meshName, renderOrder: entry.renderOrder ?? 0 },
  );

export type { resolvedPreserveGltfMeshType };
export { resolvePreserveMeshes };
