'use client';

import { useConfiguratorProduct } from '@store';

import { GarmentPartMesh } from './GarmentPartMesh';
import { useGltfScene } from './GltfSceneProvider';
import { PreserveGltfMesh } from './PreserveGltfMesh';
import { resolvePreserveMeshes } from './resolvePreserveMeshes';
import { StaticGltfMesh } from './StaticGltfMesh';

const GarmentMeshes = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const { meshes, nodes } = useGltfScene();

  const resolveMeshNode = (meshName: string) => meshes[meshName] ?? nodes[meshName];
  const preserveMeshes = resolvePreserveMeshes(product.preserveGltfMeshes);

  return (
    <group>
      {product.parts.flatMap((part) =>
        part.meshNames.map((meshName) => {
          const node = resolveMeshNode(meshName);
          if (!node) return null;

          return <GarmentPartMesh key={`${part.id}-${meshName}`} registryKey={part.id} meshName={meshName} node={node} renderOrder={part.renderOrder} />;
        }),
      )}
      {product.staticMeshes?.flatMap((group) =>
        group.meshNames.map((meshName) => {
          const node = resolveMeshNode(meshName);
          if (!node) return null;

          return <StaticGltfMesh key={`static-${meshName}`} meshName={meshName} node={node} renderOrder={group.renderOrder} />;
        }),
      )}
      {preserveMeshes.map(({ meshName, renderOrder }) => {
        const node = resolveMeshNode(meshName);
        if (!node) return null;

        return <PreserveGltfMesh key={`preserve-${meshName}`} meshName={meshName} node={node} renderOrder={renderOrder} />;
      })}
    </group>
  );
};

export { GarmentMeshes };
