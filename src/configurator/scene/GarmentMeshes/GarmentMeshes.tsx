'use client';

import type { Object3D } from 'three';

import { GarmentPartMesh } from '@configurator/scene/GarmentPartMesh';
import { PreserveGltfMesh } from '@configurator/scene/PreserveGltfMesh';
import { StaticGltfMesh } from '@configurator/scene/StaticGltfMesh';
import { useGltfScene } from '@configurator/scene/GltfSceneProvider';
import { resolvePreserveMeshes } from '@configurator/scene/meshHelpers';
import { useStaggeredMeshMount } from '@configurator/scene/useStaggeredMeshMount';
import { resolveModelUrl } from '@configurator/utils';
import { useConfiguratorProduct } from '@store';
import { useCallback, useMemo } from 'react';
type garmentMeshEntryType = {
  key: string;
  registryKey: string;
  meshName: string;
  node: Object3D;
  renderOrder: number;
};

const collectMeshDescendants = (node: Object3D): Object3D[] => {
  if ('isMesh' in node && (node as unknown as { isMesh?: boolean }).isMesh) return [node];
  return node.children.flatMap(collectMeshDescendants);
};

const GarmentMeshes = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);
  const { meshes, nodes } = useGltfScene();

  const resolveMeshNode = useCallback((meshName: string) => meshes[meshName] ?? nodes[meshName], [meshes, nodes]);
  const preserveMeshes = resolvePreserveMeshes(product.preserveGltfMeshes);

  const garmentEntries = useMemo(() => {
    return product.parts.flatMap((part) =>
      part.meshNames.flatMap((meshName): garmentMeshEntryType[] => {
        const node = resolveMeshNode(meshName);
        if (!node) return [];

        return collectMeshDescendants(node).map((meshNode, index) => ({
          key: `${part.id}-${meshName}-${index}`,
          registryKey: part.id,
          meshName: meshNode.name || meshName,
          node: meshNode,
          renderOrder: part.renderOrder ?? 0,
        }));
      }),
    );
  }, [product.parts, resolveMeshNode]);

  const { revealedCount, isFullyRevealed } = useStaggeredMeshMount(garmentEntries.length, modelUrl);

  return (
    <group>
      {garmentEntries.slice(0, revealedCount).map((entry) => (
        <GarmentPartMesh key={entry.key} registryKey={entry.registryKey} meshName={entry.meshName} node={entry.node} renderOrder={entry.renderOrder} />
      ))}
      {isFullyRevealed &&
        product.staticMeshes?.flatMap((group) =>
          group.meshNames.map((meshName) => {
            const node = resolveMeshNode(meshName);
            if (!node) return null;

            return <StaticGltfMesh key={`static-${meshName}`} meshName={meshName} node={node} renderOrder={group.renderOrder} />;
          }),
        )}
      {isFullyRevealed &&
        preserveMeshes.map(({ meshName, renderOrder }) => {
          const node = resolveMeshNode(meshName);
          if (!node) return null;

          return <PreserveGltfMesh key={`preserve-${meshName}`} meshName={meshName} node={node} renderOrder={renderOrder} />;
        })}
    </group>
  );
};

export { GarmentMeshes };
