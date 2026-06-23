'use client';

import { useGLTF } from '@react-three/drei';

import { resolveModelUrl } from '../../../../../../utils/resolveModelUrl';
import { useConfiguratorProduct } from '@store';

import { GarmentLogoTextureLayer } from '../GarmentLogoTextureLayer';
import { GarmentNameTextureLayer } from '../GarmentNameTextureLayer';
import { GarmentPartMesh } from '../GarmentPartMesh';
import { GarmentTextureLayer } from '../GarmentTextureLayer';
import { PreserveGltfMesh } from '../PreserveGltfMesh';
import { PrintGizmoLayer } from '../PrintGizmoLayer';
import { StaticGltfMesh } from '../StaticGltfMesh';

const GarmentMeshes = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);
  const { meshes, nodes } = useGLTF(modelUrl);

  const resolveMeshNode = (meshName: string) => meshes[meshName] ?? nodes[meshName];

  return (
    <group key={modelUrl}>
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
      {product.preserveGltfMeshes?.map((meshName) => {
        const node = resolveMeshNode(meshName);
        if (!node) return null;

        const renderOrder = meshName === 'mans_shorts_laces' ? 2 : 0;

        return <PreserveGltfMesh key={`preserve-${meshName}`} meshName={meshName} node={node} renderOrder={renderOrder} />;
      })}
      <GarmentTextureLayer />
      <GarmentNameTextureLayer />
      <GarmentLogoTextureLayer />
      <PrintGizmoLayer />
    </group>
  );
};

export { GarmentMeshes };
