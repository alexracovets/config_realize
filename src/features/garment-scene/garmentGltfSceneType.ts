import type { GLTF } from 'three-stdlib';
import type { Mesh, Object3D } from 'three';

type garmentGltfSceneType = GLTF & {
  nodes: Record<string, Object3D>;
  meshes: Record<string, Mesh>;
};

export type { garmentGltfSceneType };
