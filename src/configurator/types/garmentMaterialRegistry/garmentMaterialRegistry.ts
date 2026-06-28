import type { MeshStandardMaterial } from 'three';

interface garmentMaterialRegistryValueType {
  register: (key: string, material: MeshStandardMaterial) => void;
  unregister: (key: string, material: MeshStandardMaterial) => void;
  getMaterials: (key: string) => readonly MeshStandardMaterial[];
  hasMaterialsForParts: (partIds: readonly string[]) => boolean;
  subscribeMaterials: (listener: () => void) => () => void;
  getRevision: () => number;
  bumpRevision: () => void;
}

export type { garmentMaterialRegistryValueType };
