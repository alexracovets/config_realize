import type { garmentConfigType } from '@types';
import type { MeshStandardMaterial } from 'three';

import { upgradeGarmentMaterialShader } from '../createGarmentMaterial/createGarmentMaterial';

type ScheduleGarmentShaderUpgradeOptions = {
  parts: garmentConfigType['parts'];
  getMaterials: (registryKey: string) => readonly MeshStandardMaterial[];
  invalidate: () => void;
  onComplete: () => void;
};

const scheduleGarmentShaderUpgrade = ({ parts, getMaterials, invalidate, onComplete }: ScheduleGarmentShaderUpgradeOptions) => {
  const materialQueue = parts.flatMap((part) => [...getMaterials(part.id)]);

  if (materialQueue.length === 0) {
    onComplete();
    return () => {};
  }

  let cancelled = false;

  const run = () => {
    if (cancelled) return;

    for (const material of materialQueue) {
      upgradeGarmentMaterialShader(material);
    }

    invalidate();
    onComplete();
  };

  requestAnimationFrame(run);

  return () => {
    cancelled = true;
  };
};

export { scheduleGarmentShaderUpgrade };
