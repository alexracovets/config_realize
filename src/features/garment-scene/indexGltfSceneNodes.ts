import type { Mesh, Object3D } from 'three';
import type { GLTF } from 'three-stdlib';

import type { garmentGltfSceneType } from './garmentGltfSceneType';

const gltfSceneIndexCache = new WeakMap<GLTF, Pick<garmentGltfSceneType, 'nodes' | 'meshes'>>();

const indexGltfSceneNodes = (gltf: GLTF): Pick<garmentGltfSceneType, 'nodes' | 'meshes'> => {
  const cached = gltfSceneIndexCache.get(gltf);
  if (cached) return cached;

  const typed = gltf as garmentGltfSceneType;
  if (typed.nodes && typed.meshes && Object.keys(typed.nodes).length > 0) {
    gltfSceneIndexCache.set(gltf, { nodes: typed.nodes, meshes: typed.meshes });
    return { nodes: typed.nodes, meshes: typed.meshes };
  }

  const nodes: Record<string, Object3D> = {};
  const meshes: Record<string, Mesh> = {};

  gltf.scene.traverse((child) => {
    if (!child.name) return;

    nodes[child.name] = child;

    if ('isMesh' in child && (child as Mesh).isMesh) {
      meshes[child.name] = child as Mesh;
    }
  });

  const index = { nodes, meshes };
  gltfSceneIndexCache.set(gltf, index);
  return index;
};

const enrichGltfScene = (gltf: GLTF): garmentGltfSceneType => ({
  ...(gltf as garmentGltfSceneType),
  ...indexGltfSceneNodes(gltf),
});

export { enrichGltfScene, indexGltfSceneNodes };
