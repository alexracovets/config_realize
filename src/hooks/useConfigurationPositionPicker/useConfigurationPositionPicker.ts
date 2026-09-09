'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { syncPrintPositionRelationsForFollower, syncPrintPositionRelationsForLeader } from '@configurator/hooks/syncPrintPositionRelations';
import { focusGarmentCamera } from '@hooks';
import type { configurationPositionPickerInstanceType, configurationPositionPickerPositionType } from '@types';
import { resolvePrintPositionConflicts } from '@store/resolvePrintPositionConflicts';
import { useGarmentName, useGarmentNumber, useGarmentTesto } from '@store';

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

      resolvePrintPositionConflicts(position);

      nextInstanceIdRef.current += 1;
      const instanceId = `${position.key}_${nextInstanceIdRef.current}`;
      onAddInstance(position, instanceId);
      syncPrintPositionRelationsForFollower(instanceId);

      const nameLeader = useGarmentName.getState().instances.find((instance) => instance.id === instanceId);
      const numberLeader = useGarmentNumber.getState().instances.find((instance) => instance.id === instanceId);
      const testoLeader = useGarmentTesto.getState().instances.find((instance) => instance.id === instanceId);
      if (nameLeader) syncPrintPositionRelationsForLeader('name', nameLeader);
      if (numberLeader) syncPrintPositionRelationsForLeader('number', numberLeader);
      if (testoLeader) syncPrintPositionRelationsForLeader('testo', testoLeader);

      focusGarmentCamera(position);
      setOpenItems((current) => [...current, instanceId]);
    },
    [availablePositions, onAddInstance],
  );

  const handleItemActivate = useCallback(
    (instanceId: string) => {
      const instance = instances.find((item) => item.id === instanceId);
      if (instance) focusGarmentCamera(instance);
    },
    [instances],
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
