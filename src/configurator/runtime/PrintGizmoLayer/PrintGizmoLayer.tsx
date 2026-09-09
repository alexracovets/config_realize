'use client';

import type { PrintPlacementInstance } from '@configurator/types';
import { buildLogoGizmoElements, buildPrintablePartMeshes } from '@configurator/gizmo';
import { useGizmoButtonHover, useGizmoButtonScaleSync, useGizmoSelection, usePrintPlacementMigration, usePrintPositionRelationSync } from '@configurator/hooks';
import { registerPrintRelationE2eDebug } from '@configurator/hooks/registerPrintRelationE2eDebug';
import { PrintGizmoInstance } from '@configurator/runtime/PrintGizmoLayer/PrintGizmoInstance';
import { repairPrintInstancePlacement, resolvePrintAtlasSize } from '@configurator/utils';
import { useConfigurationControl, useConfiguratorProduct, useGarmentLogo, useGarmentName, useGarmentNumber, useGarmentTesto } from '@store';
import { memo, useCallback, useEffect, useMemo } from 'react';

const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;
const LOGO_STEP = 7;

const PrintGizmoLayer = memo(() => {
  const product = useConfiguratorProduct((state) => state.product);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  usePrintPositionRelationSync();
  useEffect(() => registerPrintRelationE2eDebug(), []);
  const isGizmoVisible = useConfigurationControl((state) => state.isGizmoVisible);

  const nameInstances = useGarmentName((state) => state.instances);
  const clearNameSelectedInstance = useGarmentName((state) => state.clearSelectedInstance);

  const numberInstances = useGarmentNumber((state) => state.instances);
  const clearNumberSelectedInstance = useGarmentNumber((state) => state.clearSelectedInstance);

  const testoInstances = useGarmentTesto((state) => state.instances);
  const clearTestoSelectedInstance = useGarmentTesto((state) => state.clearSelectedInstance);

  const logoInstances = useGarmentLogo((state) => state.instances);
  const logoSelectedInstanceId = useGarmentLogo((state) => state.selectedInstanceId);
  const setLogoSelectedInstance = useGarmentLogo((state) => state.setSelectedInstance);
  const clearLogoSelectedInstance = useGarmentLogo((state) => state.clearSelectedInstance);
  const bringLogoInstanceToFront = useGarmentLogo((state) => state.bringInstanceToFront);

  const updateNameInstance = useCallback((id: string, patch: Partial<PrintPlacementInstance>) => {
    useGarmentName.getState().updateInstance(id, patch);
  }, []);

  const updateNumberInstance = useCallback((id: string, patch: Partial<PrintPlacementInstance>) => {
    useGarmentNumber.getState().updateInstance(id, patch);
  }, []);

  const updateTestoInstance = useCallback((id: string, patch: Partial<PrintPlacementInstance>) => {
    useGarmentTesto.getState().updateInstance(id, patch);
  }, []);

  const updateLogoInstance = useCallback((id: string, patch: Partial<PrintPlacementInstance>) => {
    useGarmentLogo.getState().updateInstance(id, patch);
  }, []);

  usePrintPlacementMigration({
    activeStep,
    targetStep: NAME_STEP,
    instances: nameInstances,
    parts: product.parts,
    updateInstance: updateNameInstance,
  });

  usePrintPlacementMigration({
    activeStep,
    targetStep: NUMBER_STEP,
    instances: numberInstances,
    parts: product.parts,
    updateInstance: updateNumberInstance,
  });

  usePrintPlacementMigration({
    activeStep,
    targetStep: TESTO_STEP,
    instances: testoInstances,
    parts: product.parts,
    updateInstance: updateTestoInstance,
  });

  usePrintPlacementMigration({
    activeStep,
    targetStep: LOGO_STEP,
    instances: logoInstances,
    parts: product.parts,
    updateInstance: updateLogoInstance,
    migratePlacementRotation: false,
  });

  const gizmoStep = isGizmoVisible && activeStep === LOGO_STEP ? LOGO_STEP : null;

  const logoInstancesForGizmo = useMemo(
    () => logoInstances.map((instance) => repairPrintInstancePlacement(instance, product.parts)),
    [logoInstances, product.parts],
  );

  const elements = useMemo(() => {
    if (!gizmoStep) return [];
    return buildLogoGizmoElements({ product, instances: logoInstancesForGizmo });
  }, [gizmoStep, logoInstancesForGizmo, product]);

  const selectionStore = useMemo(
    () => ({
      selectedInstanceId: logoSelectedInstanceId,
      setSelectedInstance: setLogoSelectedInstance,
      clearSelectedInstance: clearLogoSelectedInstance,
      bringInstanceToFront: bringLogoInstanceToFront,
    }),
    [bringLogoInstanceToFront, clearLogoSelectedInstance, logoSelectedInstanceId, setLogoSelectedInstance],
  );

  const atlasSize = useMemo(() => resolvePrintAtlasSize(product), [product]);
  const printableParts = useMemo(() => buildPrintablePartMeshes(product.parts), [product.parts]);

  useEffect(() => {
    if (activeStep !== NAME_STEP) clearNameSelectedInstance();
  }, [activeStep, clearNameSelectedInstance]);

  useEffect(() => {
    if (activeStep !== NUMBER_STEP) clearNumberSelectedInstance();
  }, [activeStep, clearNumberSelectedInstance]);

  useEffect(() => {
    if (activeStep !== TESTO_STEP) clearTestoSelectedInstance();
  }, [activeStep, clearTestoSelectedInstance]);

  useEffect(() => {
    if (activeStep !== LOGO_STEP) clearLogoSelectedInstance();
  }, [activeStep, clearLogoSelectedInstance]);

  useGizmoSelection({ elements, atlasSize, gizmoStep, isGizmoVisible, store: selectionStore });
  useGizmoButtonHover({ elements, atlasSize, gizmoStep, selectedInstanceId: logoSelectedInstanceId });
  useGizmoButtonScaleSync({ product });

  if (elements.length === 0) return null;

  return (
    <group>
      {elements.map((element) => (
        <PrintGizmoInstance
          key={element.id}
          element={element}
          elements={elements}
          printableParts={printableParts}
          gizmoStep={gizmoStep}
          selectedInstanceId={logoSelectedInstanceId}
        />
      ))}
    </group>
  );
});

PrintGizmoLayer.displayName = 'PrintGizmoLayer';

export { PrintGizmoLayer };
