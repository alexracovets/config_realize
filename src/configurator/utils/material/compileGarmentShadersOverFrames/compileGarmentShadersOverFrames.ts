import type { garmentConfigType } from '@types';
import type { MeshStandardMaterial } from 'three';
import { compileGarmentShader, yieldToMain } from '@configurator/utils';

type CompileGarmentShadersOverFramesOptions = {
  parts: garmentConfigType['parts'];
  getMaterials: (partId: string) => readonly MeshStandardMaterial[];
  invalidate: () => void;
  onComplete: () => void;
};

/** Compiles full garment print shaders one material per animation frame. */
const compileGarmentShadersOverFrames = ({ parts, getMaterials, invalidate, onComplete }: CompileGarmentShadersOverFramesOptions) => {
  const materialQueue = [...new Set(parts.flatMap((part) => [...getMaterials(part.id)]))];

  if (materialQueue.length === 0) {
    onComplete();
    return () => {};
  }

  let cancelled = false;
  let queueIndex = 0;

  const configureNext = async () => {
    if (cancelled) return;

    if (queueIndex >= materialQueue.length) {
      onComplete();
      return;
    }

    compileGarmentShader(materialQueue[queueIndex]);
    queueIndex += 1;
    invalidate();
    await yieldToMain();
    if (!cancelled) void configureNext();
  };

  void configureNext();

  return () => {
    cancelled = true;
  };
};

export { compileGarmentShadersOverFrames };
