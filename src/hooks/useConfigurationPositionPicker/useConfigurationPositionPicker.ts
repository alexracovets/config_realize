'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { requestConfiguratorCameraFocus } from '@configurator';
import type { configuratorCameraFocusTargetType } from '@configurator';
import type { configurationPositionPickerInstanceType, configurationPositionPickerPositionType } from '@types';
import { resolvePrintPositionConflicts } from '@store/resolvePrintPositionConflicts';

interface useConfigurationPositionPickerParamsType<TPosition extends configurationPositionPickerPositionType> {
  positions: TPosition[];
  instances: configurationPositionPickerInstanceType[];
  onAddInstance: (position: TPosition, instanceId: string) => void;
  resolveFocusFromPosition?: (position: TPosition) => configuratorCameraFocusTargetType | null;
  resolveFocusFromInstance?: (instance: configurationPositionPickerInstanceType) => configuratorCameraFocusTargetType | null;
}

const useConfigurationPositionPicker = <TPosition extends configurationPositionPickerPositionType>({
  positions,
  instances,
  onAddInstance,
  resolveFocusFromPosition,
  resolveFocusFromInstance,
}: useConfigurationPositionPickerParamsType<TPosition>) => {
  const nextInstanceIdRef = useRef(0);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const availablePositions = useMemo(() => {
    const usedKeys = new Set(instances.map((instance) => instance.positionKey));
    return positions.filter((position) => position.interactive && !usedKeys.has(position.key));
  }, [instances, positions]);

  const resolvedOpenItems = useMemo(() => {
    const validIds = new Set(instances.map((instance) => instance.id));
    return openItems.filter((id) => validIds.has(id));
  }, [instances, openItems]);

  const focusFromPosition = useCallback(
    (position: TPosition) => {
      const target = resolveFocusFromPosition?.(position);
      if (target) requestConfiguratorCameraFocus(target);
    },
    [resolveFocusFromPosition],
  );

  const focusFromInstance = useCallback(
    (instance: configurationPositionPickerInstanceType) => {
      const target = resolveFocusFromInstance?.(instance);
      if (target) requestConfiguratorCameraFocus(target);
    },
    [resolveFocusFromInstance],
  );

  const handlePositionSelect = useCallback(
    (positionKey: string) => {
      const position = availablePositions.find((item) => item.key === positionKey);
      if (!position) return;

      resolvePrintPositionConflicts(position);

      nextInstanceIdRef.current += 1;
      const instanceId = `${position.key}_${nextInstanceIdRef.current}`;
      onAddInstance(position, instanceId);
      focusFromPosition(position);
      setOpenItems((current) => [...current, instanceId]);
    },
    [availablePositions, focusFromPosition, onAddInstance],
  );

  const handleItemActivate = useCallback(
    (instanceId: string) => {
      const instance = instances.find((item) => item.id === instanceId);
      if (instance) focusFromInstance(instance);
    },
    [focusFromInstance, instances],
  );

  const handleOpenItemsChange = useCallback((value: string[]) => {
    setOpenItems([...value]);
  }, []);

  return {
    availablePositions,
    openItems: resolvedOpenItems,
    handleItemActivate,
    handleOpenItemsChange,
    handlePositionSelect,
  };
};

export { useConfigurationPositionPicker };
