import type { garmentConfigType } from '@types';
import type { MeshStandardMaterial } from 'three';

import { upgradeGarmentMaterialShader } from '../createGarmentMaterial/createGarmentMaterial';
import { yieldToMain } from '../logoFile/preloadLogoDisplayUrl/preloadLogoDisplayUrl';

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

  let index = 0;
  let cancelled = false;

  const step = async () => {
    while (index < materialQueue.length && !cancelled) {
      upgradeGarmentMaterialShader(materialQueue[index]!);
      index += 1;
      invalidate();

      if (index < materialQueue.length) {
        await yieldToMain();
      }
    }

    if (!cancelled) {
      invalidate();
      onComplete();
    }
  };

  void step();

  return () => {
    cancelled = true;
  };
};

export { scheduleGarmentShaderUpgrade };
