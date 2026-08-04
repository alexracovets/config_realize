'use client';

import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';

import { getGizmoButtonScale, subscribeGizmoButtonScale, syncGizmoButtonScaleFromViewport } from '@configurator/gizmo';
import { useGarmentMaterialRegistry } from '@configurator/providers';
import type { garmentConfigType } from '@types';

type useGizmoButtonScaleSyncOptions = {
  product: garmentConfigType;
};

const useGizmoButtonScaleSync = ({ product }: useGizmoButtonScaleSyncOptions) => {
  const { getMaterials } = useGarmentMaterialRegistry();
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => syncGizmoButtonScaleFromViewport(), []);

  useEffect(() => {
    const applyScale = () => {
      const scale = getGizmoButtonScale();
      for (const part of product.parts) {
        for (const material of getMaterials(part.id)) {
          const uniform = material.userData.uNameGizmoBtnScaleUniform as { value: number } | undefined;
          if (uniform) uniform.value = scale;
        }
      }
      invalidate();
    };

    applyScale();
    return subscribeGizmoButtonScale(applyScale);
  }, [getMaterials, invalidate, product.parts]);
};

export { useGizmoButtonScaleSync };
