'use client';

import { useEffect } from 'react';

import type { garmentPartConfigType } from '@types';
import type { PrintPlacementInstance } from '@configurator/types';
import { repairPrintInstancePlacement } from '@configurator/utils';

interface UsePrintPlacementMigrationOptions {
  activeStep: number;
  targetStep: number;
  instances: PrintPlacementInstance[];
  parts: garmentPartConfigType[];
  updateInstance: (id: string, patch: Partial<PrintPlacementInstance>) => void;
  migratePlacementRotation?: boolean;
}

/** Repairs legacy print placement when entering a print configuration step. */
const usePrintPlacementMigration = ({
  activeStep,
  targetStep,
  instances,
  parts,
  updateInstance,
  migratePlacementRotation = true,
}: UsePrintPlacementMigrationOptions) => {
  useEffect(() => {
    if (activeStep !== targetStep) return;

    instances.forEach((instance) => {
      const repaired = repairPrintInstancePlacement(instance, parts);
      const needsPlacementMigration = migratePlacementRotation && instance.placementRotation === undefined && instance.rotation !== 0;
      const needsUvRepair = repaired.partId !== instance.partId || repaired.uv.x !== instance.uv.x || repaired.uv.y !== instance.uv.y;

      if (!needsPlacementMigration && !needsUvRepair) return;

      updateInstance(instance.id, {
        ...(needsUvRepair ? { partId: repaired.partId, uv: repaired.uv } : {}),
        ...(needsPlacementMigration ? { placementRotation: instance.rotation, rotation: 0 } : {}),
      });
    });
  }, [activeStep, instances, migratePlacementRotation, parts, targetStep, updateInstance]);
};

export { usePrintPlacementMigration };
