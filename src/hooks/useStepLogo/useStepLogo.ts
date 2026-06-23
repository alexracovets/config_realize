'use client';

import { useCallback, useMemo } from 'react';

import { useGarmentLogo } from '@store';
import type { logoInstanceType, stepLogoPartStateType, stepLogoPositionStateType, stepLogoStoreViewType } from '@types';

const mapInstanceToPart = (instance: logoInstanceType): stepLogoPartStateType => ({
  id: instance.id,
  positionKey: instance.positionKey,
  label: instance.label,
  uv: instance.uv,
  rotation: instance.rotation,
  opacity: instance.opacity,
  baseScale: instance.scale,
  scale: instance.scale,
  src: instance.src,
  fileName: instance.fileName,
  visible: true,
  isDefault: instance.isDefault,
});

const mapPositionToStep = (position: {
  key: string;
  label: string;
  uv: { x: number; y: number };
  rotation: number;
  scale: number;
  isDefault: boolean;
  interactive: boolean;
  src?: string;
}): stepLogoPositionStateType => ({
  key: position.key,
  label: position.label,
  uv: position.uv,
  rotation: position.rotation,
  scale: position.scale,
  default: position.isDefault,
  interactive: position.interactive,
  defaultSrc: position.src ?? '',
});

const useStepLogo = <T>(selector: (state: stepLogoStoreViewType) => T): T => {
  const instances = useGarmentLogo((state) => state.instances);
  const positions = useGarmentLogo((state) => state.positions);
  const canAddUserLogo = useGarmentLogo((state) => state.canAddUserLogo);
  const removeInstance = useGarmentLogo((state) => state.removeInstance);
  const updateInstance = useGarmentLogo((state) => state.updateInstance);

  const parts = useMemo(() => instances.map(mapInstanceToPart), [instances]);
  const stepPositions = useMemo(() => positions.map(mapPositionToStep), [positions]);

  const removePart = useCallback((id: string) => removeInstance(id), [removeInstance]);

  const updatePart = useCallback(
    (id: string, patch: Partial<stepLogoPartStateType>) => {
      const { baseScale: _baseScale, visible: _visible, ...instancePatch } = patch;
      void _baseScale;
      void _visible;
      updateInstance(id, instancePatch);
    },
    [updateInstance],
  );

  return selector({
    parts,
    positions: stepPositions,
    canAddUserLogo,
    removePart,
    updatePart,
  });
};

export { useStepLogo };
