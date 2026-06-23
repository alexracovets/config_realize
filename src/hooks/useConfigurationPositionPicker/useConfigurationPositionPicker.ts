'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import type { configurationPositionPickerInstanceType, configurationPositionPickerPositionType } from '@types';

interface useConfigurationPositionPickerParamsType<TPosition extends configurationPositionPickerPositionType> {
  positions: TPosition[];
  instances: configurationPositionPickerInstanceType[];
  onAddInstance: (position: TPosition, instanceId: string) => void;
}

const useConfigurationPositionPicker = <TPosition extends configurationPositionPickerPositionType>({
  positions,
  instances,
  onAddInstance,
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

  const handlePositionSelect = useCallback(
    (positionKey: string) => {
      const position = availablePositions.find((item) => item.key === positionKey);
      if (!position) return;

      nextInstanceIdRef.current += 1;
      const instanceId = `${position.key}_${nextInstanceIdRef.current}`;
      onAddInstance(position, instanceId);
      setOpenItems((current) => [...current, instanceId]);
    },
    [availablePositions, onAddInstance],
  );

  const handleOpenItemsChange = useCallback((value: string | string[] | null) => {
    setOpenItems(Array.isArray(value) ? value : value ? [value] : []);
  }, []);

  return {
    availablePositions,
    openItems: resolvedOpenItems,
    handleOpenItemsChange,
    handlePositionSelect,
  };
};

export { useConfigurationPositionPicker };
